"use client";

import { useState } from "react";
import { useT, type Translations } from "@/lib/i18n";
import type { AnalysisResult } from "@/lib/api";

interface Props {
  result:    AnalysisResult;
  overall:   string;
  beforeURL: string;
  afterURL:  string;
}

type Step = "idle" | "generating" | "select";

export default function ShareButton({ result, overall, beforeURL, afterURL }: Props) {
  const { t } = useT();
  const [clinic,     setClinic]     = useState("");
  const [step,       setStep]       = useState<Step>("idle");
  const [blob,       setBlob]       = useState<Blob | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const { yaw_diff, brightness_diff } = result;

  async function handleGenerate() {
    setStep("generating");
    setError(null);
    setDownloaded(false);
    try {
      const b = await buildResultImage(
        beforeURL, afterURL, overall, yaw_diff, brightness_diff, clinic, t,
      );
      setBlob(b);
      setStep("select");
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(t.shareError);
        console.error(err);
      }
      setStep("idle");
    }
  }

  function downloadBlob() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "angle-log-result.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setDownloaded(true);
  }

  async function shareToX() {
    if (!blob) return;

    let shareUrl: string | undefined;
    try {
      const fd = new FormData();
      fd.append("image", new File([blob], "angle-log-result.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/share-upload", { method: "POST", body: fd });
      if (res.ok) {
        const { id } = await res.json() as { id: string };
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        shareUrl = `${base}/r/${id}`;
      }
    } catch {
      // URL なしでもシェア続行
    }

    const text = t.shareTweetText(overall, yaw_diff, brightness_diff, clinic, shareUrl);

    if (typeof navigator.canShare === "function") {
      const file = new File([blob], "angle-log-result.jpg", { type: "image/jpeg" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text, title: "Angle Log" });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }
    }

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank", "noopener,noreferrer",
    );
    downloadBlob();
  }

  function shareToLine() {
    const text = t.shareLineText(overall, yaw_diff, brightness_diff, clinic);
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
      "_blank", "noopener,noreferrer",
    );
    downloadBlob();
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted">{t.shareClinicLabel}</label>
        <input
          type="text"
          value={clinic}
          onChange={e => setClinic(e.target.value)}
          placeholder={t.shareClinicPlaceholder}
          maxLength={40}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2
                     text-sm text-fg placeholder-muted
                     focus:outline-none focus:border-fg/40 transition-colors"
        />
      </div>

      {step !== "select" ? (
        <button
          onClick={handleGenerate}
          disabled={step === "generating"}
          className="w-full flex items-center justify-center gap-2
                     bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                     rounded-lg px-4 py-2.5 text-sm font-medium text-white
                     transition-colors active:scale-95 disabled:opacity-50"
        >
          {step === "generating" ? (
            <><Spinner />{t.shareGenerating}</>
          ) : (
            <><ShareIcon />{t.shareButton}</>
          )}
        </button>
      ) : (
        <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <p className="text-xs text-muted text-center font-medium pb-1">{t.shareModalTitle}</p>

          <button
            onClick={shareToX}
            className="w-full flex items-center justify-center gap-2
                       bg-black hover:bg-zinc-800 active:bg-zinc-900
                       rounded-lg px-4 py-2.5 text-sm font-medium text-white
                       transition-colors active:scale-95"
          >
            <XIcon />{t.shareXButton}
          </button>

          <button
            onClick={shareToLine}
            className="w-full flex items-center justify-center gap-2
                       bg-[#06C755] hover:bg-[#00b74a] active:bg-[#009e40]
                       rounded-lg px-4 py-2.5 text-sm font-medium text-white
                       transition-colors active:scale-95"
          >
            <LineIcon />{t.shareLineButton}
          </button>

          <button
            onClick={downloadBlob}
            className="w-full flex items-center justify-center gap-2
                       bg-surface border border-border hover:border-fg/40
                       rounded-lg px-4 py-2.5 text-sm font-medium text-fg
                       transition-colors active:scale-95"
          >
            <DownloadIcon />{t.shareDownloadButton}
          </button>

          <button
            onClick={() => setStep("idle")}
            className="w-full text-xs text-muted hover:text-fg transition-colors pt-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {downloaded && !error && (
        <p className="text-xs text-muted text-center leading-relaxed whitespace-pre-line">
          {t.shareDownloadHint}
        </p>
      )}
      {error && <p className="text-xs text-danger text-center">{error}</p>}
    </div>
  );
}

// ── canvas image generation ───────────────────────────────────────────────────

async function buildResultImage(
  beforeURL:  string,
  afterURL:   string,
  overall:    string,
  yawDiff:    number,
  brightDiff: number,
  clinic:     string,
  t:          Translations,
): Promise<Blob> {
  const W        = 800;
  const PHOTO_H  = 420;
  const FOOTER_H = 96;
  const H        = PHOTO_H + FOOTER_H;
  const GAP      = 8;
  const PAD      = 12;
  const PHOTO_W  = (W - PAD * 2 - GAP) / 2;

  const canvas  = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(0, 0, W, H);

  const [imgBefore, imgAfter] = await Promise.all([loadImg(beforeURL), loadImg(afterURL)]);

  drawCover(ctx, imgBefore, PAD,                 0, PHOTO_W, PHOTO_H, 12);
  drawCover(ctx, imgAfter,  PAD + PHOTO_W + GAP, 0, PHOTO_W, PHOTO_H, 12);

  function drawLabel(text: string, x: number) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
      .roundRect(x + 10, 10, 84, 26, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "bold 13px -apple-system, Helvetica Neue, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 20, 23);
    ctx.restore();
  }
  drawLabel(t.before, PAD);
  drawLabel(t.after,  PAD + PHOTO_W + GAP);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, PHOTO_H, W, 1);

  const FY = PHOTO_H + 24;
  ctx.textBaseline = "alphabetic";

  const levelColors: Record<string, string> = { ok: "#4ade80", warn: "#facc15", danger: "#f87171" };
  ctx.fillStyle = levelColors[overall] ?? "#ffffff";
  ctx.font = "bold 18px -apple-system, Helvetica Neue, sans-serif";
  const overallText = t.shareImageOverall(overall);
  ctx.fillText(overallText, PAD * 2, FY);

  if (clinic.trim()) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "13px -apple-system, Helvetica Neue, sans-serif";
    const w = ctx.measureText(overallText).width;
    ctx.fillText(`　【${clinic.trim()}】`, PAD * 2 + w, FY);
  }

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "15px -apple-system, Helvetica Neue, sans-serif";
  ctx.fillText(
    `${t.shareImageYaw(yawDiff)}　${t.shareImageBrightness(brightDiff)}`,
    PAD * 2, FY + 30,
  );

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = "12px -apple-system, Helvetica Neue, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Angle Log", W - PAD * 2, FY + 58);
  ctx.textAlign = "left";

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/jpeg", 0.92)
  );
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = () => rej(new Error("image load failed"));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement,
                   x: number, y: number, w: number, h: number, radius: number) {
  const srcAr = img.naturalWidth / img.naturalHeight;
  const dstAr = w / h;
  let sx, sy, sw, sh;
  if (srcAr > dstAr) {
    sh = img.naturalHeight; sw = sh * dstAr;
    sx = (img.naturalWidth - sw) / 2; sy = 0;
  } else {
    sw = img.naturalWidth; sh = sw / dstAr;
    sx = 0; sy = (img.naturalHeight - sh) / 2;
  }
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.630 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.630 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}
