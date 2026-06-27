"use client";

import { useEffect } from "react";
import { loadTheme, applyTheme } from "@/lib/themePrefs";

export default function ThemeProvider() {
  useEffect(() => {
    applyTheme(loadTheme());
  }, []);
  return null;
}
