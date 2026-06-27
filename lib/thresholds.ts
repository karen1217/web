/**
 * Judgment thresholds – change the numbers here and the whole UI updates.
 * Unit: degrees for angles, percent for brightness.
 */

export type Level = "ok" | "warn" | "danger";

export interface Threshold {
  ok: number;    // abs value below this → ok
  warn: number;  // abs value below this → warn, else → danger
}

export const ANGLE_THRESHOLD: Threshold = { ok: 5, warn: 15 };
export const BRIGHTNESS_THRESHOLD: Threshold = { ok: 10, warn: 30 };

export function getLevel(absValue: number, threshold: Threshold): Level {
  if (absValue <= threshold.ok) return "ok";
  if (absValue <= threshold.warn) return "warn";
  return "danger";
}

export const LEVEL_LABEL: Record<Level, string> = {
  ok:     "許容範囲",
  warn:   "やや気になる",
  danger: "相当ずれている",
};

export const LEVEL_COLOR: Record<Level, string> = {
  ok:     "text-ok",
  warn:   "text-warn",
  danger: "text-danger",
};

export const LEVEL_BG: Record<Level, string> = {
  ok:     "bg-ok/10 border-ok/30",
  warn:   "bg-warn/10 border-warn/30",
  danger: "bg-danger/10 border-danger/30",
};

// ---------------------------------------------------------------------------
// Overall score
// ---------------------------------------------------------------------------

export const OVERALL_LABEL: Record<Level, string> = {
  ok:     "ほぼ正確",
  warn:   "黄色信号",
  danger: "怪しい",
};

export const OVERALL_DESC: Record<Level, string> = {
  ok:     "角度・明るさともに許容範囲内。比較写真として信頼できます。",
  warn:   "一部の項目が気になる水準。参考にはなりますが注意が必要です。",
  danger: "大きなズレが確認されました。写真の条件が揃っておらず、見た目の差が施術効果とは限りません。",
};

export interface OverallInput {
  yaw_diff:        number;
  brightness_diff: number;
}

/**
 * Compute the overall judgment level.
 * Only yaw and brightness are scored — pitch and roll naturally vary between
 * sessions and are shown as reference values only.
 */
export function getOverallLevel(r: OverallInput): Level {
  const metrics: Level[] = [
    getLevel(Math.abs(r.yaw_diff),        ANGLE_THRESHOLD),
    getLevel(Math.abs(r.brightness_diff), BRIGHTNESS_THRESHOLD),
  ];

  if (metrics.some(l => l === "danger")) return "danger";
  if (metrics.some(l => l === "warn"))   return "warn";
  return "ok";
}
