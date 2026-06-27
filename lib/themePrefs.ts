const KEY = "angle-log-theme";

export type Theme = "dark" | "light";

const VARS: Record<Theme, Record<string, string>> = {
  dark: {
    "--color-bg":      "15 15 15",
    "--color-surface": "26 26 26",
    "--color-border":  "42 42 42",
    "--color-muted":   "102 102 102",
    "--color-fg":      "245 245 245",
  },
  light: {
    "--color-bg":      "255 255 255",
    "--color-surface": "248 249 250",
    "--color-border":  "229 231 235",
    "--color-muted":   "156 163 175",
    "--color-fg":      "15 15 15",
  },
};

export function loadTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(KEY) as Theme | null) ?? "light";
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  for (const [prop, value] of Object.entries(VARS[theme])) {
    root.style.setProperty(prop, value);
  }
}
