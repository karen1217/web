"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CameraCapture, { type CapturedShot } from "@/components/pro/CameraCapture";
import CaptureGuide from "@/components/pro/CaptureGuide";
import CasePicker from "@/components/pro/CasePicker";
import { createClient } from "@/lib/supabase/client";
import { setUnsaved } from "@/lib/unsavedStore";
import type { AnglePreset, Case } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";
import { localizePresetLabel } from "@/lib/presetLabel";

type Phase = "guide" | "camera" | "preview" | "case-select" | "details" | "saving" | "done";

// timing index offsets in days (matches captureTimingOptions order)
const TIMING_OFFSETS: (number | null)[] = [null, 0, 3, 7, 14, 30, 60, 90, 180, 365];

function calcSuggestedTimingIndex(operationDate: string): number {
  const op = new Date(operationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  op.setHours(0, 0, 0, 0);
  const days = Math.floor((today.getTime() - op.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0)   return 1;
  if (days <= 5)   return 2;
  if (days <= 10)  return 3;
  if (days <= 21)  return 4;
  if (days <= 45)  return 5;
  if (days <= 75)  return 6;
  if (days <= 105) return 7;
  if (days <= 270) return 8;
  return 9;
}

function inferOperationDate(timingIndex: number, capturedDate: string): string | null {
  const offset = TIMING_OFFSETS[timingIndex];
  if (offset === undefined || offset === null) return null;
  const d = new Date(capturedDate);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

interface Props {
  presets: AnglePreset[];
  cases:   Case[];
}

export default function CaptureClient({ presets: initialPresets, cases: initialCases }: Props) {
  const router = useRouter();
  const { t } = useT();
  const [phase, setPhase]               = useState<Phase>("guide");
  const [shots, setShots]               = useState<CapturedShot[]>([]);
  const [allPresets, setAllPresets]     = useState(initialPresets);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(
    () => new Set(initialPresets.map(p => p.id))
  );
  const [allCases, setAllCases]         = useState(initialCases);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [suggestedTimingIdx, setSuggestedTimingIdx] = useState<number | null>(null);
  const [timingIdx, setTimingIdx]       = useState<number | null>(null);
  const [customTiming, setCustomTiming] = useState("");
  const [capturedAt]                    = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes]               = useState("");
  const [error, setError]               = useState<string | null>(null);

  const supabase = createClient();

  // Full timing options = t.captureTimingOptions + Other
  const timingOptions = [...t.captureTimingOptions, t.captureTimingOther];

  useEffect(() => {
    const hasUnsaved = shots.length > 0 && phase !== "done";
    setUnsaved(hasUnsaved);

    if (!hasUnsaved) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shots.length, phase]);

  useEffect(() => () => setUnsaved(false), []);

  function applyTimingForCase(c: Case) {
    if (c.operation_date) {
      const idx = calcSuggestedTimingIndex(c.operation_date);
      setSuggestedTimingIdx(idx);
      setTimingIdx(idx);
    } else {
      setSuggestedTimingIdx(null);
      setTimingIdx(null);
    }
  }

  function handleTogglePreset(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handlePresetAdded(preset: AnglePreset) {
    setAllPresets(prev => [...prev, preset]);
    setSelectedIds(prev => new Set(Array.from(prev).concat(preset.id)));
  }

  function handlePresetRemoved(id: string) {
    setAllPresets(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }

  const activePresets = allPresets.filter(p => selectedIds.has(p.id));

  function handleCaptureDone(captured: CapturedShot[]) {
    setShots(captured);
    setPhase("preview");
  }

  function handleCaseSelected(c: Case) {
    setSelectedCase(c);
    applyTimingForCase(c);
    setPhase("details");
  }

  function handleNewCase(c: Case) {
    setAllCases(prev => [c, ...prev]);
    setSelectedCase(c);
    applyTimingForCase(c);
    setPhase("details");
  }

  async function save() {
    if (!selectedCase) return;
    setPhase("saving");
    setError(null);

    const isOther = timingIdx === timingOptions.length - 1;
    const label =
      timingIdx === null   ? "" :
      isOther              ? (customTiming.trim() || t.captureTimingOther) :
      timingOptions[timingIdx] ?? "";

    // Infer operation date from timing index if not set
    if (timingIdx !== null && timingIdx !== 0 && !isOther && !selectedCase.operation_date) {
      const opDate = inferOperationDate(timingIdx, capturedAt);
      if (opDate) {
        await supabase
          .from("cases")
          .update({ operation_date: opDate })
          .eq("id", selectedCase.id);
        const updated = { ...selectedCase, operation_date: opDate };
        setSelectedCase(updated);
        setAllCases(prev => prev.map(c => c.id === selectedCase.id ? updated : c));
      }
    }

    const { data: session, error: sessionErr } = await supabase
      .from("capture_sessions")
      .insert({
        case_id:     selectedCase.id,
        label,
        captured_at: new Date(capturedAt).toISOString(),
        notes:       notes.trim() || null,
      })
      .select()
      .single();

    if (sessionErr || !session) {
      setError(t.captureSaveFailed);
      setPhase("details");
      return;
    }

    for (const shot of shots) {
      const path = `${session.user_id}/${session.id}/${shot.preset.id}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("shots")
        .upload(path, shot.blob, { contentType: "image/jpeg", upsert: true });

      if (uploadErr) {
        setError(t.captureUploadFailed);
        setPhase("details");
        return;
      }

      await supabase.from("shots").insert({
        session_id:  session.id,
        yaw:         shot.angles.yaw,
        pitch:       shot.angles.pitch,
        roll:        shot.angles.roll,
        angle_label: shot.preset.label,
        image_path:  path,
      });
    }

    setPhase("done");
  }

  /* ── Guide ── */
  if (phase === "guide") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold mb-6">{t.capturePageTitle}</h1>
        <CaptureGuide
          presets={allPresets}
          selectedIds={selectedIds}
          onToggle={handleTogglePreset}
          onPresetAdded={handlePresetAdded}
          onPresetRemoved={handlePresetRemoved}
          onStart={() => setPhase("camera")}
        />
      </div>
    );
  }

  /* ── Camera ── */
  if (phase === "camera") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold mb-6">{t.capturePageTitle}</h1>
        <CameraCapture presets={activePresets} onComplete={handleCaptureDone} />
      </div>
    );
  }

  /* ── Preview ── */
  if (phase === "preview") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-base font-semibold">{t.capturePreviewTitle}</h2>
          <p className="text-xs text-muted mt-0.5">{t.capturePhotoCount(shots.length)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {shots.map(shot => (
            <div key={shot.preset.id} className="space-y-1.5">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.dataUrl}
                  alt={localizePresetLabel(shot.preset, t.presetDefaultLabel)}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-center text-muted">
                {localizePresetLabel(shot.preset, t.presetDefaultLabel)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setShots([]);
              setPhase("camera");
            }}
            className="flex-1 py-3 border border-border rounded-lg text-sm text-muted
                       hover:text-fg hover:border-fg/30 transition-colors"
          >
            {t.captureRetake}
          </button>
          <button
            onClick={() => setPhase("case-select")}
            className="flex-1 py-3 bg-accent text-black rounded-lg text-sm font-semibold
                       hover:opacity-90 transition-colors"
          >
            {t.captureProceed}
          </button>
        </div>
      </div>
    );
  }

  /* ── Case selection ── */
  if (phase === "case-select") {
    return (
      <CasePicker
        cases={allCases}
        onSelect={handleCaseSelected}
        onNew={handleNewCase}
        onBack={() => setPhase("preview")}
      />
    );
  }

  /* ── Session details ── */
  if (phase === "details" || phase === "saving") {
    const isOther = timingIdx === timingOptions.length - 1;

    return (
      <div className="max-w-sm mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-base font-semibold">{t.captureDetailsTitle}</h2>
          <p className="text-xs text-muted mt-0.5">
            {t.captureCaseLabel}<span className="text-fg">{selectedCase?.name}</span>
          </p>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shots.map(shot => (
            <div key={shot.preset.id} className="flex-shrink-0 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.dataUrl}
                alt={localizePresetLabel(shot.preset, t.presetDefaultLabel)}
                className="w-16 h-22 object-cover rounded-lg border border-border" />
              <p className="text-xs text-muted mt-1">
                {localizePresetLabel(shot.preset, t.presetDefaultLabel)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* Timing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-fg/70">{t.captureTimingLabel}</label>
              {timingIdx !== null && (
                <button
                  onClick={() => setTimingIdx(null)}
                  className="text-xs text-muted hover:text-fg transition-colors"
                >
                  {t.captureClearTiming}
                </button>
              )}
            </div>

            {suggestedTimingIdx !== null && timingIdx !== null && (
              <p className="text-xs text-fg/50 bg-surface border border-border rounded-lg px-3 py-2">
                {t.captureSuggestedTimingText(timingOptions[suggestedTimingIdx] ?? "")}
              </p>
            )}

            {timingIdx === null ? (
              <button
                onClick={() => setTimingIdx(1)}
                className="w-full py-2.5 border border-dashed border-border rounded-lg
                           text-sm text-muted hover:text-fg hover:border-fg/30 transition-colors"
              >
                {t.captureSelectTiming}
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {timingOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setTimingIdx(i)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors
                      ${timingIdx === i
                        ? "bg-accent text-black border-accent"
                        : "text-muted border-border hover:border-fg/40"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {isOther && (
              <input
                type="text"
                value={customTiming}
                onChange={e => setCustomTiming(e.target.value)}
                placeholder={t.captureCustomTimingPlaceholder}
                className={inputClass}
                autoFocus
              />
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.captureDateLabel}</label>
            <p className="text-sm px-3 py-2.5 bg-surface border border-border rounded-lg text-fg/60">
              {new Date(capturedAt).toLocaleDateString(undefined, {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.captureNotesLabel}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder={t.captureNotesPlaceholder}
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => setPhase("case-select")}
            disabled={phase === "saving"}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted
                       hover:text-fg hover:border-fg/30 disabled:opacity-40 transition-colors"
          >
            {t.captureBack}
          </button>
          <button
            onClick={save}
            disabled={phase === "saving"}
            className="flex-1 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                       hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {phase === "saving" ? t.captureSavingText : t.captureSaveText}
          </button>
        </div>
      </div>
    );
  }

  /* ── Done ── */
  return (
    <div className="max-w-sm mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
      <p className="text-ok text-4xl">✓</p>
      <p className="font-semibold">{t.captureDoneTitle}</p>
      <p className="text-sm text-muted">{t.captureAddedTo(selectedCase?.name ?? "")}</p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => {
            setShots([]);
            setPhase("guide");
            setSelectedCase(null);
            setNotes("");
            setTimingIdx(null);
            setSuggestedTimingIdx(null);
          }}
          className="px-5 py-2 border border-border rounded-lg text-sm text-muted
                     hover:text-fg hover:border-fg/30 transition-colors"
        >
          {t.captureContinueCapture}
        </button>
        <button
          onClick={() => router.push("/pro/timeline")}
          className="px-5 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                     hover:opacity-90 transition-colors"
        >
          {t.captureGoToTimeline}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
