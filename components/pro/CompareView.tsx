"use client";

import { useState, useEffect, useCallback } from "react";
import type { SessionWithShots } from "./TimelineGrid";

interface Props {
  sessions:  SessionWithShots[];
  imageUrls: Record<string, string>;
  onClose:   () => void;
}

const TARGET_LUM = 0.50;

// ── Canvas helpers ────────────────────────────────────────────────────────

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}

function meanLuminance(img: HTMLImageElement): number {
  const W = 64, H = Math.round(64 * img.height / (img.width || 1));
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4)
    sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  return sum / (d.length / 4) / 255;
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -Math.PI/2, 0);
  ctx.lineTo(x + w, y + h - r); ctx.arc(x + w - r, y + h - r, r, 0, Math.PI/2);
  ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + h - r, r, Math.PI/2, Math.PI);
  ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, -Math.PI/2);
  ctx.closePath();
}

// ── Component ─────────────────────────────────────────────────────────────

export default function CompareView({ sessions, imageUrls, onClose }: Props) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  );
  const allAngles = Array.from(
    new Set(sorted.flatMap(s => [...s.shots].sort((a, b) => b.yaw - a.yaw).map(sh => sh.angle_label)))
  );

  const [visibleAngles, setVisibleAngles] = useState<Set<string>>(new Set(allAngles));
  const [downloading,   setDownloading]   = useState(false);
  const [normalize,     setNormalize]     = useState(false);
  const [normLoading,   setNormLoading]   = useState(false);
  const [lumMap,        setLumMap]        = useState<Record<string, number>>({});

  const shownAngles = allAngles.filter(a => visibleAngles.has(a));

  // ── Brightness normalization ──────────────────────────────────────────

  const loadLuminance = useCallback(async () => {
    setNormLoading(true);
    const map: Record<string, number> = {};
    await Promise.allSettled(
      Object.entries(imageUrls).map(([path, url]) =>
        loadImg(url)
          .then(img => { map[path] = meanLuminance(img); })
          .catch(() => { map[path] = TARGET_LUM; })
      )
    );
    setLumMap(map);
    setNormLoading(false);
  }, [imageUrls]);

  useEffect(() => {
    if (normalize && Object.keys(lumMap).length === 0) loadLuminance();
  }, [normalize, lumMap, loadLuminance]);

  // ── Download canvas ───────────────────────────────────────────────────

  async function downloadGrid() {
    setDownloading(true);
    try {
      const cellW = 100, cellH = 133;
      const colPad = 6, rowPad = 6;
      const labelW = 68, headerH = 52;
      const cols = sorted.length, rows = shownAngles.length;
      const W = labelW + (cellW + colPad) * cols + colPad;
      const H = headerH + (cellH + rowPad) * rows + rowPad;

      const canvas = document.createElement("canvas");
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, W, H);

      const imgMap: Record<string, HTMLImageElement> = {};
      await Promise.allSettled(
        sorted.flatMap(s =>
          s.shots.filter(sh => shownAngles.includes(sh.angle_label)).map(sh => {
            const url = imageUrls[sh.image_path];
            if (!url) return Promise.resolve();
            return loadImg(url).then(img => { imgMap[sh.image_path] = img; }).catch(() => {});
          })
        )
      );

      // Session headers
      sorted.forEach((session, ci) => {
        const x = labelW + ci * (cellW + colPad) + cellW / 2 + colPad;
        ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(session.label || "未選択", x, 20, cellW);
        ctx.font = "10px sans-serif"; ctx.fillStyle = "#666666";
        ctx.fillText(
          new Date(session.captured_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
          x, 38, cellW
        );
      });

      shownAngles.forEach((label, ri) => {
        const y = headerH + ri * (cellH + rowPad) + rowPad;
        ctx.font = "10px sans-serif"; ctx.textAlign = "right"; ctx.fillStyle = "#666666";
        ctx.fillText(label, labelW - 6, y + cellH / 2 + 4);

        sorted.forEach((session, ci) => {
          const x = labelW + ci * (cellW + colPad) + colPad;
          const shot = session.shots.find(sh => sh.angle_label === label);

          ctx.fillStyle = "#1a1a1a";
          rrect(ctx, x, y, cellW, cellH, 4);
          ctx.fill();

          if (shot) {
            const img = imgMap[shot.image_path];
            if (img) {
              ctx.save();
              rrect(ctx, x, y, cellW, cellH, 4);
              ctx.clip();
              const sc = Math.max(cellW / img.width, cellH / img.height);
              ctx.drawImage(img, x + (cellW - img.width*sc)/2, y + (cellH - img.height*sc)/2, img.width*sc, img.height*sc);
              ctx.restore();
            }
          }
        });
      });

      canvas.toBlob(blob => {
        if (!blob) { setDownloading(false); return; }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "比較グリッド.jpg";
        a.click();
        URL.revokeObjectURL(a.href);
        setDownloading(false);
      }, "image/jpeg", 0.92);
    } catch {
      setDownloading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold">比較 ({sorted.length}件)</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadGrid}
            disabled={downloading || shownAngles.length === 0}
            className="text-xs text-muted hover:text-fg transition-colors disabled:opacity-40"
          >
            {downloading ? "作成中…" : "⬇ 保存"}
          </button>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors text-sm">
            閉じる ✕
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-b border-border flex-shrink-0 space-y-2">
        {/* Angle filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted flex-shrink-0">角度</span>
          <button onClick={() => setVisibleAngles(new Set(allAngles))} className="text-xs text-muted hover:text-fg transition-colors">すべて</button>
          <span className="text-muted text-xs">·</span>
          <button onClick={() => setVisibleAngles(new Set())} className="text-xs text-muted hover:text-fg transition-colors">クリア</button>
          {allAngles.map(label => (
            <button key={label} onClick={() => setVisibleAngles(prev => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; })}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors
                ${visibleAngles.has(label) ? "bg-accent text-black border-accent" : "text-muted border-border hover:border-fg/40"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Normalize toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNormalize(v => !v)}
            disabled={normLoading}
            className={`px-3 py-1 rounded-full text-xs border transition-colors disabled:opacity-40
              ${normalize ? "bg-accent text-black border-accent" : "text-muted border-border hover:border-fg/40"}`}
          >
            {normLoading ? "計算中…" : "照明補正"}
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="flex-1 overflow-auto p-4">
        {shownAngles.length === 0 ? (
          <p className="text-sm text-muted text-center mt-10">角度を選択してください</p>
        ) : (
          <table className="border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="w-24" />
                {sorted.map(session => (
                  <th key={session.id} className="text-center min-w-[96px]">
                    <p className="text-xs font-semibold text-fg truncate max-w-[96px]">
                      {session.label || "未選択"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(session.captured_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shownAngles.map(label => (
                <tr key={label}>
                  <td className="text-right pr-2 align-middle">
                    <span className="text-xs text-muted whitespace-nowrap">{label}</span>
                  </td>
                  {sorted.map(session => {
                    const shot = session.shots.find(sh => sh.angle_label === label);
                    const url  = shot ? imageUrls[shot.image_path] : null;
                    const lum  = shot && lumMap[shot.image_path];
                    const filter = normalize && lum ? `brightness(${(TARGET_LUM / lum).toFixed(2)})` : undefined;

                    return (
                      <td key={session.id} className="align-top">
                        <div className="w-24 h-32 bg-surface rounded-lg overflow-hidden border border-border">
                          {url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={label} className="w-full h-full object-cover"
                              style={filter ? { filter } : undefined} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted">なし</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
