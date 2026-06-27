import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors — backed by CSS variables for dark/light mode
        bg:      "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border:  "rgb(var(--color-border) / <alpha-value>)",
        muted:   "rgb(var(--color-muted) / <alpha-value>)",
        // fg replaces text-white/X so it inverts in light mode
        fg:      "rgb(var(--color-fg) / <alpha-value>)",
        // Brand accent
        accent:       "#93c5fd",
        "accent-light": "#e5effe",
        // Judgment colors (accent replaces green for ok)
        ok:     "rgb(147 197 253 / <alpha-value>)",   // #93c5fd
        warn:   "#eab308",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-noto)", "Hiragino Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
