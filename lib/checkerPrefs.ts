const KEY = "angle-log-checker-prefs";

export interface CheckerPrefs {
  yaw:        boolean;
  pitch:      boolean;
  roll:       boolean;
  brightness: boolean;
}

const DEFAULTS: CheckerPrefs = { yaw: true, pitch: false, roll: false, brightness: true };

export function loadCheckerPrefs(): CheckerPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function saveCheckerPrefs(prefs: CheckerPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
