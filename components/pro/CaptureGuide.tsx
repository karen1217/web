"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AnglePreset } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";

interface Props {
  presets:         AnglePreset[];
  selectedIds:     Set<string>;
  onToggle:        (id: string) => void;
  onPresetAdded:   (preset: AnglePreset) => void;
  onPresetRemoved: (id: string) => void;
  onStart:         () => void;
}

export default function CaptureGuide({
  presets, selectedIds, onToggle, onPresetAdded, onPresetRemoved, onStart,
}: Props) {
  const { t } = useT();
  const [angleOpen, setAngleOpen] = useState(false);
  const [newYaw,    setNewYaw]    = useState("");
  const [newLabel,  setNewLabel]  = useState("");
  const [adding,    setAdding]    = useState(false);
  const [addError,  setAddError]  = useState<string | null>(null);

  const supabase = createClient();
  const selectedCount = Array.from(selectedIds).filter(id =>
    presets.some(p => p.id === id)
  ).length;

  async function handleAdd() {
    const yaw = parseFloat(newYaw);
    if (isNaN(yaw) || yaw < -180 || yaw > 180) {
      setAddError(t.captureAddError);
      return;
    }
    const label = newLabel.trim() || `${yaw > 0 ? "+" : ""}${yaw}°`;
    setAdding(true); setAddError(null);

    const { data, error } = await supabase
      .from("angle_presets")
      .insert({ yaw, label, is_default: false, sort_order: presets.length })
      .select()
      .single();

    setAdding(false);
    if (error || !data) { setAddError(t.captureAddFailed); return; }
    onPresetAdded(data as AnglePreset);
    setNewYaw(""); setNewLabel("");
  }

  async function handleRemove(id: string) {
    const { error } = await supabase.from("angle_presets").delete().eq("id", id);
    if (!error) onPresetRemoved(id);
  }

  const sorted = [...presets].sort((a, b) => b.yaw - a.yaw);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 text-center max-w-sm mx-auto">
      <h2 className="text-base font-semibold">{t.captureGuideTitle}</h2>

      {/* Animation */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <FaceAnimation />
      </div>

      {/* Steps */}
      <ol className="space-y-3 text-left w-full">
        {[
          { n: 1, icon: "·",  text: t.captureStep1 },
          { n: 2, icon: "→",  text: t.captureStep2 },
          { n: 3, icon: "↙",  text: t.captureStep3 },
          { n: 4, icon: "←",  text: t.captureStep4 },
        ].map(({ n, icon, text }) => (
          <li key={n} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-surface border border-border
                             text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {n}
            </span>
            <span className="text-lg leading-none w-6 text-center">{icon}</span>
            <span className="text-sm text-fg/80">{text}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
        {t.captureHint}
      </p>

      {/* ── Angle selector ── */}
      <div className="w-full border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setAngleOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm
                     hover:bg-fg/5 transition-colors"
        >
          <span className="font-medium">{t.captureAngleSection}</span>
          <span className="text-muted text-xs flex items-center gap-2">
            {t.captureSelectedCount(selectedCount)}
            <span>{angleOpen ? "▲" : "▼"}</span>
          </span>
        </button>

        {angleOpen && (
          <div className="border-t border-border px-4 py-4 space-y-3 text-left">
            {/* Preset list */}
            <div className="space-y-1.5">
              {sorted.map(preset => {
                const checked = selectedIds.has(preset.id);
                return (
                  <div key={preset.id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <button
                      onClick={() => onToggle(preset.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <span className={`w-5 h-5 rounded border flex items-center justify-center
                        flex-shrink-0 transition-colors
                        ${checked
                          ? "bg-accent border-accent"
                          : "border-border bg-transparent"}`}
                      >
                        {checked && (
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span className="text-sm tabular-nums text-muted w-12">
                        {preset.yaw > 0 ? "+" : ""}{preset.yaw}°
                      </span>
                      <span className="text-sm">{preset.label}</span>
                    </button>
                    <button
                      onClick={() => handleRemove(preset.id)}
                      className="text-xs text-muted hover:text-danger transition-colors pl-2"
                    >
                      {t.captureDelete}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick add */}
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-xs text-muted">{t.captureAddAngle}</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newYaw}
                  onChange={e => setNewYaw(e.target.value)}
                  placeholder={t.captureAnglePlaceholder}
                  min={-180} max={180}
                  className="w-20 bg-bg border border-border rounded-lg px-2.5 py-2
                             text-sm text-fg placeholder-muted
                             focus:outline-none focus:border-fg/40"
                />
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder={t.captureLabelPlaceholder}
                  className="flex-1 bg-bg border border-border rounded-lg px-2.5 py-2
                             text-sm text-fg placeholder-muted
                             focus:outline-none focus:border-fg/40"
                  onKeyDown={e => e.key === "Enter" && newYaw && handleAdd()}
                />
                <button
                  onClick={handleAdd}
                  disabled={adding || !newYaw}
                  className="px-3 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                             hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {adding ? "…" : t.captureAdd}
                </button>
              </div>
              {addError && <p className="text-xs text-danger">{addError}</p>}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        disabled={selectedCount === 0}
        className="w-full py-3 bg-accent text-black rounded-lg text-sm font-semibold
                   hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        {selectedCount === 0 ? t.captureStartDisabled : t.captureStart(selectedCount)}
      </button>
    </div>
  );
}

function FaceAnimation() {
  return (
    <div className="relative">
      <style>{`
        @keyframes faceRotate {
          0%   { transform: perspective(120px) rotateY(0deg);   }
          15%  { transform: perspective(120px) rotateY(0deg);   }
          35%  { transform: perspective(120px) rotateY(55deg);  }
          50%  { transform: perspective(120px) rotateY(55deg);  }
          60%  { transform: perspective(120px) rotateY(0deg);   }
          70%  { transform: perspective(120px) rotateY(0deg);   }
          85%  { transform: perspective(120px) rotateY(-55deg); }
          95%  { transform: perspective(120px) rotateY(-55deg); }
          100% { transform: perspective(120px) rotateY(0deg);   }
        }
      `}</style>
      <div
        style={{ animation: "faceRotate 4s ease-in-out infinite" }}
        className="w-20 h-20 rounded-full bg-surface border-2 border-border
                   flex items-center justify-center text-4xl select-none"
      >
        🙂
      </div>
    </div>
  );
}
