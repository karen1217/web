"use client";

import { useState } from "react";
import ShareButton from "./ShareButton";
import FaceAngleDemo, { type FaceMetric } from "./FaceAngleDemo";
import {
  ANGLE_THRESHOLD,
  BRIGHTNESS_THRESHOLD,
  getLevel,
  LEVEL_COLOR,
  LEVEL_BG,
  type Level,
  type Threshold,
} from "@/lib/thresholds";
import type { AnalysisResult } from "@/lib/api";
import { loadCheckerPrefs, saveCheckerPrefs } from "@/lib/checkerPrefs";
import { useT } from "@/lib/i18n";

interface ScoringFlags {
  yaw:        boolean;
  pitch:      boolean;
  roll:       boolean;
  brightness: boolean;
}

function calcOverall(result: AnalysisResult, flags: ScoringFlags): Level {
  const levels: Level[] = [];
  if (flags.yaw)        levels.push(getLevel(Math.abs(result.yaw_diff),        ANGLE_THRESHOLD));
  if (flags.pitch)      levels.push(getLevel(Math.abs(result.pitch_diff),       ANGLE_THRESHOLD));
  if (flags.roll)       levels.push(getLevel(Math.abs(result.roll_diff),        ANGLE_THRESHOLD));
  if (flags.brightness) levels.push(getLevel(Math.abs(result.brightness_diff),  BRIGHTNESS_THRESHOLD));
  if (levels.length === 0) return "ok";
  if (levels.some(l => l === "danger")) return "danger";
  if (levels.some(l => l === "warn"))   return "warn";
  return "ok";
}

const METRIC_UNITS: Record<string, string> = {
  yaw: "°", brightness: "%", pitch: "°", roll: "°",
};
const METRIC_THRESHOLDS = {
  yaw: ANGLE_THRESHOLD, brightness: BRIGHTNESS_THRESHOLD,
  pitch: ANGLE_THRESHOLD, roll: ANGLE_THRESHOLD,
} as const;
const METRIC_DEFAULTS = { yaw: true, brightness: true, pitch: false, roll: false };

const OVERALL_ICON: Record<Level, string> = { ok: "✓", warn: "!", danger: "!!" };

interface Props {
  result:    AnalysisResult;
  beforeURL: string;
  afterURL:  string;
}

export default function Result({ result, beforeURL, afterURL }: Props) {
  const { t } = useT();
  const { yaw_diff, pitch_diff, roll_diff, brightness_diff } = result;

  const METRIC_INFO = [
    { key: "yaw" as const,        unit: METRIC_UNITS.yaw,        threshold: METRIC_THRESHOLDS.yaw,        title: t.metrics.yaw.title,        desc: t.metrics.yaw.sub,        defaultOn: METRIC_DEFAULTS.yaw },
    { key: "brightness" as const, unit: METRIC_UNITS.brightness, threshold: METRIC_THRESHOLDS.brightness, title: t.metrics.brightness.title, desc: t.metrics.brightness.sub, defaultOn: METRIC_DEFAULTS.brightness },
    { key: "pitch" as const,      unit: METRIC_UNITS.pitch,      threshold: METRIC_THRESHOLDS.pitch,      title: t.metrics.pitch.title,      desc: t.metrics.pitch.sub,      defaultOn: METRIC_DEFAULTS.pitch },
    { key: "roll" as const,       unit: METRIC_UNITS.roll,       threshold: METRIC_THRESHOLDS.roll,       title: t.metrics.roll.title,       desc: t.metrics.roll.sub,       defaultOn: METRIC_DEFAULTS.roll },
  ];

  const [scoring, setScoring] = useState<ScoringFlags>(() => loadCheckerPrefs());
  const [scoringOpen,    setScoringOpen]    = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const overall = calcOverall(result, scoring);
  const values: Record<string, number> = {
    yaw: yaw_diff, pitch: pitch_diff, roll: roll_diff, brightness: brightness_diff,
  };

  function toggle(key: keyof ScoringFlags) {
    setScoring(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveCheckerPrefs(next);
      return next;
    });
  }

  return (
    <section className="space-y-6" id="result">

      {/* Overall score */}
      <div className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${LEVEL_BG[overall]}`}>
        <div className={`text-3xl font-black w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0
          ${overall === "ok" ? "border-ok text-ok" : overall === "warn" ? "border-warn text-warn" : "border-danger text-danger"}`}>
          {OVERALL_ICON[overall]}
        </div>
        <div>
          <p className={`text-xl font-bold ${LEVEL_COLOR[overall]}`}>
            {overall === "ok" ? t.overallOk : overall === "warn" ? t.overallWarn : t.overallDanger}
          </p>
          <p className="text-sm text-fg/60 mt-0.5 leading-snug">
            {overall === "ok" ? t.overallDescOk : overall === "warn" ? t.overallDescWarn : t.overallDescDanger}
          </p>
        </div>
      </div>

      {/* Photos */}
      <div className="grid grid-cols-2 gap-3">
        <PhotoCard src={beforeURL} caption={t.before} angles={result.before_angles} />
        <PhotoCard src={afterURL}  caption={t.after}  angles={result.after_angles} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METRIC_INFO.map(m => {
          const val      = values[m.key];
          const abs      = Math.abs(val);
          const level    = getLevel(abs, m.threshold as Threshold);
          const on       = scoring[m.key];
          const expanded = expandedMetric === m.key;
          return (
            <div
              key={m.key}
              className={`rounded-xl border p-4 flex flex-col gap-1.5 transition-opacity
                ${on ? LEVEL_BG[level] : "border-border opacity-40"}`}
            >
              <p className="text-xs text-fg/50 leading-tight">{m.title}</p>
              <p className={`text-3xl font-bold tabular-nums tracking-tight ${on ? LEVEL_COLOR[level] : "text-muted"}`}>
                {val > 0 ? "+" : ""}{val}{m.unit}
              </p>
              {on
                ? <span className={`text-xs font-medium flex items-center gap-1 ${LEVEL_COLOR[level]}`}>● {level === "ok" ? t.levelOk : level === "warn" ? t.levelWarn : t.levelDanger}</span>
                : <span className="text-xs text-muted">{t.notScored}</span>
              }
              <button
                onClick={() => setExpandedMetric(expanded ? null : m.key)}
                className="text-xs text-muted hover:text-fg/70 mt-0.5 text-left transition-colors"
              >
                {expanded ? t.detailsClose : t.detailsOpen}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded metric detail */}
      {expandedMetric && (() => {
        const m   = METRIC_INFO.find(x => x.key === expandedMetric)!;
        const val = values[expandedMetric as keyof typeof values];
        const abs = Math.abs(val);
        const level = getLevel(abs, m.threshold as Threshold);
        return (
          <div className="rounded-xl border border-border bg-surface p-5 flex gap-5 items-center">
            <FaceAngleDemo metric={expandedMetric as FaceMetric} angle={val} animate size={88} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{m.title}</p>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${LEVEL_COLOR[level]}`}>
                {val > 0 ? "+" : ""}{val}{m.unit}
              </p>
              <p className="text-xs text-fg/70 mt-2 leading-relaxed">
                {getContextDetail(expandedMetric, val, level, t)}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Scoring settings */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setScoringOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-fg/70
                     hover:text-fg hover:bg-fg/5 transition-colors"
        >
          <span>{t.editScoring}</span>
          <span className="text-muted text-xs">{scoringOpen ? "▲" : "▼"}</span>
        </button>

        {scoringOpen && (
          <div className="border-t border-border divide-y divide-border">
            {METRIC_INFO.map(m => {
              const on = scoring[m.key];
              return (
                <div key={m.key} className="px-4 py-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(m.key)}
                    className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative mt-0.5
                      ${on ? "bg-accent" : "bg-fg/20"}`}
                    role="switch"
                    aria-checked={on}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-bg transition-transform
                      ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share */}
      <div className="flex justify-center">
        <ShareButton
          result={result}
          overall={overall === "ok" ? t.overallOk : overall === "warn" ? t.overallWarn : t.overallDanger}
          beforeURL={beforeURL}
          afterURL={afterURL}
        />
      </div>
    </section>
  );
}

function getContextDetail(metric: string, value: number, level: Level, t: import("@/lib/i18n").Translations): string {
  const abs = Math.abs(value);
  const cd  = t.contextDetail;
  switch (metric) {
    case "yaw": {
      const dir = value > 0 ? cd.yaw.dirRight : cd.yaw.dirLeft;
      if (level === "ok")     return cd.yaw.ok(abs, dir);
      if (level === "warn")   return cd.yaw.warn(abs, dir);
      return cd.yaw.danger(abs, dir);
    }
    case "pitch": {
      const dir = value > 0 ? cd.pitch.dirUp : cd.pitch.dirDown;
      if (level === "ok") return cd.pitch.ok(abs, dir);
      return cd.pitch.warn(abs, dir);
    }
    case "roll": {
      const dir = value > 0 ? cd.roll.dirRight : cd.roll.dirLeft;
      if (level === "ok") return cd.roll.ok(abs, dir);
      return cd.roll.warn(abs, dir);
    }
    case "brightness": {
      if (level === "ok")   return cd.brightness.ok(abs);
      if (level === "warn") return cd.brightness.warn(abs);
      return cd.brightness.danger(abs);
    }
    default: return "";
  }
}

function PhotoCard({ src, caption, angles }: {
  src: string; caption: string; angles: { yaw: number; pitch: number; roll: number };
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-fg/60">{caption}</p>
      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} className="w-full h-full object-cover" />
      </div>
      <div className="flex justify-between text-xs text-muted px-0.5">
        <span>Y {angles.yaw > 0 ? "+" : ""}{angles.yaw}°</span>
        <span>P {angles.pitch > 0 ? "+" : ""}{angles.pitch}°</span>
        <span>R {angles.roll > 0 ? "+" : ""}{angles.roll}°</span>
      </div>
    </div>
  );
}
