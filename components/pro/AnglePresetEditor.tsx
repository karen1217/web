"use client";

import { useState } from "react";
import type { AnglePreset } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

interface Props {
  presets:    AnglePreset[];
  onUpdated:  (presets: AnglePreset[]) => void;
}

export default function AnglePresetEditor({ presets, onUpdated }: Props) {
  const { t } = useT();
  const [list, setList]     = useState(presets);
  const [newYaw, setNewYaw] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const supabase = createClient();

  async function addPreset() {
    const yaw = parseFloat(newYaw);
    if (isNaN(yaw) || yaw < -180 || yaw > 180) {
      setError(t.presetAddError);
      return;
    }
    const label = newLabel.trim() || `${yaw > 0 ? "+" : ""}${yaw}°`;
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("angle_presets")
      .insert({ yaw, label, is_default: false, sort_order: list.length })
      .select()
      .single();

    setSaving(false);
    if (error || !data) { setError(t.presetAddFailed); return; }

    const next = [...list, data];
    setList(next);
    onUpdated(next);
    setNewYaw("");
    setNewLabel("");
  }

  async function removePreset(id: string) {
    const { error } = await supabase.from("angle_presets").delete().eq("id", id);
    if (error) { setError(t.presetDeleteFailed); return; }

    const next = list.filter(p => p.id !== id);
    setList(next);
    onUpdated(next);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {list
          .slice()
          .sort((a, b) => b.yaw - a.yaw)
          .map(preset => (
            <div
              key={preset.id}
              className="flex items-center justify-between bg-surface border border-border
                         rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums w-14 text-muted">
                  {preset.yaw > 0 ? "+" : ""}{preset.yaw}°
                </span>
                <span className="text-sm">{preset.label}</span>
              </div>
              <button
                onClick={() => removePreset(preset.id)}
                className="text-xs text-muted hover:text-danger transition-colors"
              >
                {t.presetDelete}
              </button>
            </div>
          ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={newYaw}
          onChange={e => setNewYaw(e.target.value)}
          placeholder={t.presetAnglePlaceholder}
          min={-180}
          max={180}
          className="w-28 bg-surface border border-border rounded-lg px-3 py-2 text-sm
                     text-fg placeholder-muted focus:outline-none focus:border-fg/40"
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder={t.presetLabelPlaceholder}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm
                     text-fg placeholder-muted focus:outline-none focus:border-fg/40"
        />
        <button
          onClick={addPreset}
          disabled={saving || !newYaw}
          className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                     hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {t.presetAdd}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
