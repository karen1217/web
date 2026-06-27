import type { AnglePreset } from "@/lib/supabase/types";

// Japanese default labels seeded by Supabase trigger
const JA_DEFAULTS = new Set([
  "正面", "斜め30°右", "斜め45°右", "斜め30°左", "斜め45°左",
]);

export function localizePresetLabel(
  preset: AnglePreset,
  presetDefaultLabel: (yaw: number) => string,
): string {
  if (preset.is_default || JA_DEFAULTS.has(preset.label)) {
    return presetDefaultLabel(preset.yaw);
  }
  return preset.label;
}
