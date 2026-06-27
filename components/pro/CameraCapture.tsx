"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getFaceLandmarker, extractAngles, type FaceAngles } from "@/lib/mediapipe";
import AngleIndicator from "./AngleIndicator";
import type { AnglePreset } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";

interface CapturedShot {
  preset:  AnglePreset;
  angles:  FaceAngles;
  dataUrl: string;
  blob:    Blob;
}

interface Props {
  presets:    AnglePreset[];
  onComplete: (shots: CapturedShot[]) => void;
}

type State = "detecting" | "done";

const LOCK_FRAMES        = 12;
const TOLERANCE_YAW      = 8;   // side angles: ±8°
const TOLERANCE_YAW_FRONT = 4;  // front: tighter yaw ±4°
const TOLERANCE_PITCH    = 8;   // front: pitch ±8° (not too far up/down)
const TOLERANCE_ROLL     = 5;   // front: roll ±5° (not tilted)

// Custom capture order: front → right30 → right45 → left30 → left45
function captureOrder(yaw: number): number {
  if (Math.abs(yaw) < 5) return 0;
  if (yaw > 0) return yaw;          // right: 30, 45
  return 1000 - yaw;                // left: 1030, 1045  (closer first)
}

export default function CameraCapture({ presets, onComplete }: Props) {
  const { t } = useT();
  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const lockRef      = useRef(0);
  const activeIdxRef = useRef(0);
  const capturedRef  = useRef<Set<string>>(new Set());

  const [state, setState]               = useState<State>("detecting");
  const [angles, setAngles]             = useState<FaceAngles | null>(null);
  const [shots, setShots]               = useState<CapturedShot[]>([]);
  const [lockProgress, setLockProgress] = useState(0);
  const [error, setError]               = useState<string | null>(null);

  // Order: front (0°) → right (30→45) → left (30→45)
  const sortedPresets = [...presets].sort((a, b) => captureOrder(a.yaw) - captureOrder(b.yaw));
  const sortedPresetsRef = useRef(sortedPresets);
  sortedPresetsRef.current = sortedPresets;

  const captureFrame = useCallback(
    (angles: FaceAngles, preset: AnglePreset, nextIdx: number) => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Update refs SYNCHRONOUSLY before toBlob so the rAF loop
      // skips this preset on the very next tick (toBlob is async).
      capturedRef.current.add(preset.id);
      activeIdxRef.current = nextIdx;
      lockRef.current      = 0;
      setLockProgress(0);

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);

      canvas.toBlob(blob => {
        if (!blob) return;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setShots(prev => {
          const next = [...prev, { preset, angles, dataUrl, blob }];
          if (next.length === sortedPresetsRef.current.length) {
            setState("done");
            onComplete(next);
          }
          return next;
        });
      }, "image/jpeg", 0.9);
    },
    [onComplete]
  );

  useEffect(() => {
    if (state !== "detecting") return;

    activeIdxRef.current = 0;
    lockRef.current      = 0;
    capturedRef.current  = new Set();

    let running    = true;
    let lastMs     = 0;
    let stream:    MediaStream;
    let landmarker: Awaited<ReturnType<typeof getFaceLandmarker>>;

    async function start() {
      try {
        landmarker = await getFaceLandmarker();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        if (!running) { stream.getTracks().forEach(t => t.stop()); return; }
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        tick(performance.now());
      } catch {
        setError("カメラへのアクセスに失敗しました");
      }
    }

    function tick(now: number) {
      if (!running) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Throttle detection to ~30fps
      if (now - lastMs < 33) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastMs = now;

      const result    = landmarker.detectForVideo(video, now);
      const extracted = extractAngles(result);
      setAngles(extracted);

      const presets = sortedPresetsRef.current;
      const idx     = activeIdxRef.current;

      if (extracted && idx < presets.length) {
        const preset    = presets[idx];
        const isFront   = Math.abs(preset.yaw) < 10;
        const yawTol    = isFront ? TOLERANCE_YAW_FRONT : TOLERANCE_YAW;
        const yawOk     = Math.abs(extracted.yaw   - preset.yaw) <= yawTol;
        const pitchOk   = !isFront || Math.abs(extracted.pitch) <= TOLERANCE_PITCH;
        const rollOk    = !isFront || Math.abs(extracted.roll)  <= TOLERANCE_ROLL;
        const aligned   = yawOk && pitchOk && rollOk;

        if (!capturedRef.current.has(preset.id)) {
          if (aligned) {
            lockRef.current++;
            setLockProgress(lockRef.current / LOCK_FRAMES);
            if (lockRef.current >= LOCK_FRAMES) {
              captureFrame(extracted, preset, idx + 1);
            }
          } else {
            if (lockRef.current > 0) { lockRef.current = 0; setLockProgress(0); }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    start();
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [state, captureFrame]);

  const currentPreset = sortedPresets[activeIdxRef.current];
  const progress      = shots.length / sortedPresets.length;

  // For front angle, also show pitch/roll hints
  const phaseLabel = (() => {
    if (!currentPreset) return "";
    if (currentPreset.yaw > 10)  return t.cameraHintTurnLeft;
    if (currentPreset.yaw < -10) return t.cameraHintTurnRight;
    if (!angles) return t.cameraHintFront;
    // Front: give specific axis feedback
    const yawOff   = Math.abs(angles.yaw)   > TOLERANCE_YAW_FRONT;
    const pitchOff = Math.abs(angles.pitch) > TOLERANCE_PITCH;
    const rollOff  = Math.abs(angles.roll)  > TOLERANCE_ROLL;
    if (!yawOff && !pitchOff && !rollOff) return t.cameraHintHold;
    if (rollOff)  return angles.roll  > 0 ? t.cameraHintRollRight : t.cameraHintRollLeft;
    if (pitchOff) return angles.pitch > 0 ? t.cameraHintPitchDown : t.cameraHintPitchUp;
    return t.cameraHintMoreFront;
  })();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera feed */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-surface rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Phase instruction */}
        {state === "detecting" && currentPreset && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="bg-black/80 backdrop-blur-sm rounded-full px-5 py-2 text-sm text-white font-semibold shadow-lg">
              {phaseLabel}
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-ok font-semibold text-lg">{t.cameraHintDone}</p>
          </div>
        )}

        {/* Lock progress bar */}
        {state === "detecting" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-border">
            <div
              className="h-full bg-ok transition-all duration-75"
              style={{ width: `${lockProgress * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Angle indicators */}
      <div className="flex flex-wrap justify-center gap-2">
        {sortedPresets.map(preset => (
          <AngleIndicator
            key={preset.id}
            currentYaw={state === "detecting" ? (angles?.yaw ?? null) : null}
            targetYaw={preset.yaw}
            tolerance={Math.abs(preset.yaw) < 10 ? TOLERANCE_YAW_FRONT : TOLERANCE_YAW}
            label={preset.label}
            captured={capturedRef.current.has(preset.id)}
          />
        ))}
      </div>

      {/* Overall progress */}
      {state === "detecting" && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>{shots.length} / {sortedPresets.length} 枚撮影済み</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ok transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger text-center">{error}</p>}
    </div>
  );
}

export type { CapturedShot };
