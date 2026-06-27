"use client";

import { useRef, useState, useEffect } from "react";
import { useT } from "@/lib/i18n";

interface Props {
  imageFile: File;
  imageUrl:  string;
  onDone:    (newFile: File, newUrl: string) => void;
  onClose:   () => void;
}

interface DetectedRegion {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
}

type Mode = "auto" | "manual";
type UndoFrame = { overlay: ImageData; mask: ImageData };

// ── detection helpers ─────────────────────────────────────────────────────────

function luminanceVariance(data: Uint8ClampedArray, stride: number, x: number, y: number, w: number, h: number): number {
  let sum = 0, sumSq = 0, count = 0;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const i = ((y + dy) * stride + (x + dx)) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += lum; sumSq += lum * lum; count++;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function detectAnnotationRegions(canvas: HTMLCanvasElement, labels: {
  tl: string; tr: string; bl: string; br: string; color: string;
}): DetectedRegion[] {
  const ctx = canvas.getContext("2d")!;
  const { width: W, height: H } = canvas;
  const { data } = ctx.getImageData(0, 0, W, H);
  const regions: DetectedRegion[] = [];

  const cw = Math.floor(W * 0.22);
  const ch = Math.floor(H * 0.13);
  const THRESHOLD = 350;

  const corners = [
    { id: "tl", label: labels.tl, x: 0,      y: 0,      w: cw, h: ch },
    { id: "tr", label: labels.tr, x: W - cw,  y: 0,      w: cw, h: ch },
    { id: "bl", label: labels.bl, x: 0,       y: H - ch, w: cw, h: ch },
    { id: "br", label: labels.br, x: W - cw,  y: H - ch, w: cw, h: ch },
  ];

  for (const c of corners) {
    if (luminanceVariance(data, W, c.x, c.y, c.w, c.h) > THRESHOLD) {
      regions.push(c);
    }
  }

  // Detect colored annotations (pure red/yellow/blue/green)
  let minX = W, maxX = 0, minY = H, maxY = 0, found = false;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const isAnnotation =
        (r > 190 && g < 70 && b < 70) ||  // red
        (r > 190 && g > 150 && b < 60) ||  // yellow
        (b > 190 && r < 70 && g < 70) ||   // blue
        (g > 190 && r < 70 && b < 70);     // green
      if (isAnnotation) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        found = true;
      }
    }
  }
  if (found && (maxX - minX) > 5 && (maxY - minY) > 5) {
    const pad = 12;
    regions.push({
      id: "color",
      label: labels.color,
      x: Math.max(0, minX - pad),
      y: Math.max(0, minY - pad),
      w: Math.min(W, maxX - minX + pad * 2),
      h: Math.min(H, maxY - minY + pad * 2),
    });
  }

  return regions;
}

function blurFillRegions(srcCanvas: HTMLCanvasElement, regions: DetectedRegion[], checkedIds: Set<string>): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { width: W, height: H } = srcCanvas;

    // Draw blurred version
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = W; blurCanvas.height = H;
    const blurCtx = blurCanvas.getContext("2d")!;
    blurCtx.filter = "blur(18px)";
    blurCtx.drawImage(srcCanvas, 0, 0);
    blurCtx.filter = "none";

    // Composite: stamp blurred regions back onto a copy of the original
    const outCanvas = document.createElement("canvas");
    outCanvas.width = W; outCanvas.height = H;
    const outCtx = outCanvas.getContext("2d")!;
    outCtx.drawImage(srcCanvas, 0, 0);

    for (const r of regions) {
      if (!checkedIds.has(r.id)) continue;
      const blurred = blurCtx.getImageData(r.x, r.y, r.w, r.h);
      outCtx.putImageData(blurred, r.x, r.y);
    }

    outCanvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.93);
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export default function InpaintModal({ imageFile, imageUrl, onDone, onClose }: Props) {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>("auto");

  // ── auto mode state ──
  const srcCanvasRef   = useRef<HTMLCanvasElement>(null);
  const autoImgRef     = useRef<HTMLImageElement>(null);
  const highlightRef   = useRef<HTMLCanvasElement>(null);
  const [detected,     setDetected]     = useState<DetectedRegion[] | null>(null);
  const [checked,      setChecked]      = useState<Set<string>>(new Set());
  const [applying,     setApplying]     = useState(false);
  const [autoError,    setAutoError]    = useState<string | null>(null);

  // ── manual mode state ──
  const imgRef     = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const maskRef    = useRef<HTMLCanvasElement>(null);
  const drawing    = useRef(false);
  const undoStack  = useRef<UndoFrame[]>([]);
  const initialized = useRef(false);
  const [brushSize,  setBrushSize]  = useState(24);
  const [inpainting, setInpainting] = useState(false);
  const [ready,      setReady]      = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // ── auto: load image into canvas and detect ───────────────────────────────

  function runDetection() {
    const img = autoImgRef.current;
    const canvas = srcCanvasRef.current;
    if (!img || !canvas || !img.naturalWidth) return;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const regions = detectAnnotationRegions(canvas, {
      tl: t.annotationCornerTL,
      tr: t.annotationCornerTR,
      bl: t.annotationCornerBL,
      br: t.annotationCornerBR,
      color: t.annotationColorLabel,
    });
    setDetected(regions);
    setChecked(new Set(regions.map(r => r.id)));
    drawHighlights(regions);
  }

  function drawHighlights(regions: DetectedRegion[]) {
    const hl = highlightRef.current;
    const img = autoImgRef.current;
    if (!hl || !img) return;
    hl.width  = img.clientWidth;
    hl.height = img.clientHeight;
    const ctx = hl.getContext("2d")!;
    ctx.clearRect(0, 0, hl.width, hl.height);

    const scaleX = img.clientWidth  / (img.naturalWidth  || 1);
    const scaleY = img.clientHeight / (img.naturalHeight || 1);

    for (const r of regions) {
      const color = r.id === "color" ? "#f59e0b" : "#3b82f6";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color + "22";
      ctx.beginPath();
      ctx.roundRect(r.x * scaleX, r.y * scaleY, r.w * scaleX, r.h * scaleY, 4);
      ctx.fill();
      ctx.stroke();
    }
  }

  async function handleAutoRemove() {
    const canvas = srcCanvasRef.current;
    if (!canvas || !detected) return;
    setApplying(true); setAutoError(null);
    try {
      const blob = await blurFillRegions(canvas, detected, checked);
      const newFile = new File([blob], "cleaned.jpg", { type: "image/jpeg" });
      onDone(newFile, URL.createObjectURL(blob));
    } catch {
      setAutoError(t.annotationApplyError);
      setApplying(false);
    }
  }

  function toggleChecked(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── manual mode ──────────────────────────────────────────────────────────

  function initCanvases() {
    const img = imgRef.current;
    const overlay = overlayRef.current;
    const mask = maskRef.current;
    if (!img || !overlay || !mask) return;
    const w = img.clientWidth, h = img.clientHeight;
    if (!w || !h) return;
    overlay.width = w; overlay.height = h;
    mask.width = w;    mask.height = h;
    const mc = mask.getContext("2d")!;
    mc.fillStyle = "black"; mc.fillRect(0, 0, w, h);
    undoStack.current = [];
    initialized.current = true;
    setReady(true);
  }

  useEffect(() => {
    const onResize = () => { if (initialized.current) initCanvases(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function getXY(e: React.MouseEvent | React.TouchEvent) {
    const rect = overlayRef.current!.getBoundingClientRect();
    const src  = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function saveUndo() {
    const overlay = overlayRef.current!, mask = maskRef.current!;
    undoStack.current.push({
      overlay: overlay.getContext("2d")!.getImageData(0, 0, overlay.width, overlay.height),
      mask:    mask.getContext("2d")!.getImageData(0, 0, mask.width, mask.height),
    });
    if (undoStack.current.length > 30) undoStack.current.shift();
  }

  function paintAt(x: number, y: number) {
    const r = brushSize / 2;
    const oc = overlayRef.current!.getContext("2d")!;
    oc.beginPath(); oc.arc(x, y, r, 0, Math.PI * 2);
    oc.fillStyle = "rgba(255,50,50,0.45)"; oc.fill();
    const mc = maskRef.current!.getContext("2d")!;
    mc.beginPath(); mc.arc(x, y, r, 0, Math.PI * 2);
    mc.fillStyle = "white"; mc.fill();
  }

  function onDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault(); saveUndo(); drawing.current = true;
    const { x, y } = getXY(e); paintAt(x, y);
  }
  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault(); if (!drawing.current) return;
    const { x, y } = getXY(e); paintAt(x, y);
  }
  function onUp() { drawing.current = false; }

  function handleUndo() {
    if (!undoStack.current.length) return;
    const frame = undoStack.current.pop()!;
    overlayRef.current!.getContext("2d")!.putImageData(frame.overlay, 0, 0);
    maskRef.current!.getContext("2d")!.putImageData(frame.mask, 0, 0);
  }

  function handleClear() {
    saveUndo();
    const ov = overlayRef.current!;
    ov.getContext("2d")!.clearRect(0, 0, ov.width, ov.height);
    const mc = maskRef.current!.getContext("2d")!;
    mc.fillStyle = "black"; mc.fillRect(0, 0, maskRef.current!.width, maskRef.current!.height);
  }

  async function handleInpaint() {
    setInpainting(true); setManualError(null);
    try {
      const maskBlob = await new Promise<Blob>((res, rej) =>
        maskRef.current!.toBlob(b => b ? res(b) : rej(new Error("mask failed")), "image/png")
      );
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("mask", maskBlob, "mask.png");
      const resp = await fetch("/api/inpaint", { method: "POST", body: fd });
      if (!resp.ok) throw new Error(await resp.text().catch(() => "error"));
      const blob = await resp.blob();
      onDone(new File([blob], "inpainted.jpg", { type: "image/jpeg" }), URL.createObjectURL(blob));
    } catch (err) {
      setManualError(err instanceof Error ? err.message : t.annotationApplyError);
      setInpainting(false);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold">{t.annotationTitle}</h2>
          <p className="text-xs text-muted">{t.annotationAutoHint}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-fg text-sm transition-colors">
          {t.close}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 px-4 pt-3 pb-2 flex-shrink-0">
        {(["auto", "manual"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors
              ${mode === m ? "bg-accent text-black" : "text-muted border border-border hover:text-fg"}`}
          >
            {m === "auto" ? t.annotationAutoTab : t.annotationManualTab}
          </button>
        ))}
      </div>

      {/* ── Auto mode ── */}
      {mode === "auto" && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="relative" style={{ lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={autoImgRef}
                src={imageUrl}
                alt=""
                className="w-full block select-none"
                draggable={false}
                onLoad={runDetection}
              />
              <canvas
                ref={highlightRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: "100%", height: "100%" }}
              />
              <canvas ref={srcCanvasRef} className="hidden" />
            </div>
          </div>

          <div className="flex-shrink-0 px-4 py-4 space-y-3 border-t border-border bg-bg">
            {detected === null && (
              <p className="text-xs text-muted text-center">{t.annotationDetecting}</p>
            )}
            {detected !== null && detected.length === 0 && (
              <p className="text-xs text-muted text-center">{t.annotationNoneDetected}</p>
            )}
            {detected !== null && detected.length > 0 && (
              <div className="space-y-2">
                {detected.map(r => (
                  <label key={r.id} className="flex items-center gap-3 cursor-pointer">
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                        transition-colors ${checked.has(r.id) ? "bg-accent border-accent" : "border-border"}`}
                      onClick={() => toggleChecked(r.id)}
                    >
                      {checked.has(r.id) && (
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-fg/90" onClick={() => toggleChecked(r.id)}>
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {autoError && <p className="text-xs text-danger">{autoError}</p>}

            <button
              onClick={handleAutoRemove}
              disabled={applying || checked.size === 0 || detected === null}
              className="w-full py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                         hover:opacity-90 disabled:opacity-40 transition-colors"
            >
              {applying ? t.annotationRemoving : t.annotationRemove}
            </button>
          </div>
        </>
      )}

      {/* ── Manual mode ── */}
      {mode === "manual" && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="relative" style={{ lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt=""
                className="w-full block select-none"
                draggable={false}
                onLoad={initCanvases}
              />
              <canvas
                ref={overlayRef}
                className="absolute top-0 left-0"
                style={{ touchAction: "none", cursor: ready ? "crosshair" : "default", pointerEvents: ready ? "auto" : "none" }}
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
              />
              <canvas ref={maskRef} className="hidden" />
            </div>
          </div>

          <div className="flex-shrink-0 px-4 py-4 space-y-3 border-t border-border bg-bg">
            <p className="text-xs text-muted">{t.annotationManualHint}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted flex-shrink-0 w-24">{t.annotationBrushLabel(brushSize)}</span>
              <input
                type="range" min={6} max={80} value={brushSize}
                onChange={e => setBrushSize(Number(e.target.value))}
                className="flex-1 accent-white"
              />
              <div
                className="flex-shrink-0 rounded-full bg-red-500/60 border border-red-400"
                style={{ width: Math.min(brushSize, 40), height: Math.min(brushSize, 40) }}
              />
            </div>

            {manualError && <p className="text-xs text-danger">{manualError}</p>}

            <div className="flex gap-2">
              <button onClick={handleUndo}
                className="px-3 py-2.5 border border-border rounded-lg text-xs text-muted hover:text-fg transition-colors">
                {t.annotationUndo}
              </button>
              <button onClick={handleClear}
                className="px-3 py-2.5 border border-border rounded-lg text-xs text-muted hover:text-fg transition-colors">
                {t.annotationClear}
              </button>
              <button
                onClick={handleInpaint}
                disabled={inpainting || !ready}
                className="flex-1 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                           hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {inpainting ? t.annotationApplying : t.annotationApply}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
