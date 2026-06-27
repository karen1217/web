"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { CheckerResult } from "@/lib/supabase/types";
import { OVERALL_LABEL, LEVEL_COLOR } from "@/lib/thresholds";
import type { Level } from "@/lib/thresholds";
import { useT } from "@/lib/i18n";

interface Props {
  results:   CheckerResult[];
  imageUrls: Record<string, string>;
  onDelete:  (r: CheckerResult) => void;
  deleting:  string | null;
}

export default function CheckerTimeline({ results: initial, imageUrls, onDelete, deleting }: Props) {
  const { t } = useT();
  const [results, setResults]         = useState(initial);
  const [levelFilter, setLevelFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [editingId, setEditingId]     = useState<string | null>(null);

  // Sync when parent deletes a result
  useEffect(() => { setResults(initial); }, [initial]);

  const supabase = createClient();

  async function handleLabelSave(id: string, label: string | null) {
    setResults(prev => prev.map(r => r.id === id ? { ...r, label } : r));
    setEditingId(null);
    await supabase.from("checker_results").update({ label }).eq("id", id);
  }

  const levelFilters = [
    { value: "all",    label: t.checkerLevelAll },
    { value: "ok",     label: t.overallOk },
    { value: "warn",   label: t.overallWarn },
    { value: "danger", label: t.overallDanger },
  ];

  const usedLabels = Array.from(new Set(results.map(r => r.label).filter((l): l is string => !!l)));

  const filtered = results
    .filter(r => levelFilter === "all" || r.overall_level === levelFilter)
    .filter(r => {
      if (labelFilter === "all")  return true;
      if (labelFilter === "none") return !r.label;
      return r.label === labelFilter;
    });

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted text-sm gap-2">
        <span className="text-3xl opacity-30">🔍</span>
        <p>{t.checkerEmpty}</p>
        <p className="text-xs">{t.checkerEmptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Level filter */}
      <div className="flex flex-wrap gap-1.5">
        {levelFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setLevelFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors
              ${levelFilter === f.value
                ? "bg-accent text-black border-accent"
                : "text-muted border-border hover:border-fg/40 hover:text-fg"}`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1 opacity-60">
                ({results.filter(r => r.overall_level === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Label filter */}
      {usedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setLabelFilter("all")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors
              ${labelFilter === "all"
                ? "bg-fg/10 text-fg border-fg/30"
                : "text-muted border-border hover:border-fg/40"}`}
          >
            {t.checkerAllLabels}
          </button>
          {usedLabels.map(l => (
            <button
              key={l}
              onClick={() => setLabelFilter(l)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors
                ${labelFilter === l
                  ? "bg-fg/10 text-fg border-fg/30"
                  : "text-muted border-border hover:border-fg/40"}`}
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => setLabelFilter("none")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors
              ${labelFilter === "none"
                ? "bg-fg/10 text-fg border-fg/30"
                : "text-muted border-border hover:border-fg/40"}`}
          >
            {t.checkerNoLabel}
          </button>
        </div>
      )}

      {/* Count */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">{t.checkerNoResults}</p>
      ) : (
        <p className="text-xs text-muted">{t.checkerResultCount(filtered.length)}</p>
      )}

      {/* Cards */}
      {filtered.map(r => (
        <CheckerCard
          key={r.id}
          result={r}
          imageUrls={imageUrls}
          onDelete={() => onDelete(r)}
          deleting={deleting === r.id}
          editing={editingId === r.id}
          onEditStart={() => setEditingId(r.id)}
          onEditCancel={() => setEditingId(null)}
          onLabelSave={label => handleLabelSave(r.id, label)}
        />
      ))}
    </div>
  );
}

function CheckerCard({ result, imageUrls, onDelete, deleting, editing, onEditStart, onEditCancel, onLabelSave }: {
  result:       CheckerResult;
  imageUrls:    Record<string, string>;
  onDelete:     () => void;
  deleting:     boolean;
  editing:      boolean;
  onEditStart:  () => void;
  onEditCancel: () => void;
  onLabelSave:  (label: string | null) => void;
}) {
  const { t } = useT();
  const [customLabel, setCustomLabel] = useState("");
  const level = result.overall_level as Level;
  const beforeUrl = imageUrls[result.before_path];
  const afterUrl  = imageUrls[result.after_path];

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0
            ${level === "ok"     ? "border-ok/40 text-ok bg-ok/10" :
              level === "warn"   ? "border-warn/40 text-warn bg-warn/10" :
                                   "border-danger/40 text-danger bg-danger/10"}`}
          >
            {OVERALL_LABEL[level] ?? level}
          </span>

          {!editing ? (
            <button
              onClick={onEditStart}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors flex-shrink-0
                ${result.label
                  ? "border-fg/20 text-fg bg-fg/5 hover:bg-fg/10"
                  : "border-dashed border-border text-muted hover:border-fg/30 hover:text-fg"}`}
            >
              {result.label ?? t.checkerAddLabel}
            </button>
          ) : (
            <LabelEditor
              current={result.label}
              customLabel={customLabel}
              onCustomChange={setCustomLabel}
              onSave={onLabelSave}
              onCancel={onEditCancel}
            />
          )}

          <p className="text-xs text-muted ml-auto flex-shrink-0">
            {new Date(result.created_at).toLocaleDateString(undefined, {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs text-muted hover:text-danger transition-colors disabled:opacity-40 pl-2 flex-shrink-0"
        >
          {deleting ? "…" : t.timelineDelete}
        </button>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <PhotoCell url={beforeUrl} label={t.before} />
        <PhotoCell url={afterUrl}  label={t.after} />
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-xs text-muted">
        <span>
          {t.checkerYawLabel} <span className={`font-semibold ${LEVEL_COLOR[level]}`}>
            {result.yaw_diff > 0 ? "+" : ""}{result.yaw_diff}°
          </span>
        </span>
        <span>
          {t.checkerBrightnessLabel} <span className="font-semibold text-fg">
            {result.brightness_diff > 0 ? "+" : ""}{result.brightness_diff}%
          </span>
        </span>
        <span className="text-fg/30">Pitch {result.pitch_diff > 0 ? "+" : ""}{result.pitch_diff}°</span>
        <span className="text-fg/30">Roll {result.roll_diff > 0 ? "+" : ""}{result.roll_diff}°</span>
      </div>
    </div>
  );
}

function LabelEditor({ current, customLabel, onCustomChange, onSave, onCancel }: {
  current:        string | null;
  customLabel:    string;
  onCustomChange: (v: string) => void;
  onSave:         (label: string | null) => void;
  onCancel:       () => void;
}) {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-2 w-full pt-1 pb-2">
      <div className="flex flex-wrap gap-1">
        {t.checkerPresetLabels.map(l => (
          <button
            key={l}
            onClick={() => onSave(l)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors
              ${current === l
                ? "bg-accent text-black border-accent"
                : "text-muted border-border hover:border-fg/40 hover:text-fg"}`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => onSave(null)}
          className="px-2.5 py-1 rounded-full text-xs border border-dashed border-border text-muted hover:text-fg hover:border-fg/30 transition-colors"
        >
          {t.checkerNoLabel}
        </button>
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={customLabel}
          onChange={e => onCustomChange(e.target.value)}
          placeholder={t.checkerCustomInput}
          className="flex-1 bg-bg border border-border rounded-lg px-2.5 py-1 text-xs text-fg
                     placeholder-muted focus:outline-none focus:border-fg/40"
          onKeyDown={e => {
            if (e.key === "Enter" && customLabel.trim()) onSave(customLabel.trim());
            if (e.key === "Escape") onCancel();
          }}
        />
        <button
          onClick={() => customLabel.trim() && onSave(customLabel.trim())}
          className="px-2 py-1 text-xs bg-accent text-black rounded-lg disabled:opacity-40"
          disabled={!customLabel.trim()}
        >
          {t.checkerConfirm}
        </button>
        <button onClick={onCancel} className="px-2 py-1 text-xs text-muted hover:text-fg">
          {t.checkerCancel}
        </button>
      </div>
    </div>
  );
}

function PhotoCell({ url, label }: { url: string | undefined; label: string }) {
  return (
    <div className="relative bg-bg" style={{ paddingBottom: "75%" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        {url ? (
          <Image src={url} alt={label} fill className="object-contain" unoptimized />
        ) : (
          <span className="text-muted text-xs">{label}</span>
        )}
      </div>
      <span className="absolute bottom-1.5 left-2 text-xs text-fg/50 bg-black/40 px-1.5 py-0.5 rounded">
        {label}
      </span>
    </div>
  );
}
