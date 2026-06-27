import { analyzeImageFile } from "./mediapipe";
import { measureBrightness } from "./brightness";

export interface AnalysisResult {
  yaw_diff:          number;
  pitch_diff:        number;
  roll_diff:         number;
  brightness_diff:   number;
  before_angles:     { yaw: number; pitch: number; roll: number };
  after_angles:      { yaw: number; pitch: number; roll: number };
  partial_detection: boolean;
  error:             string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  no_face_detected:
    "顔を検出できませんでした。顔が画面の中心に来るよう調整してください。",
  too_many_faces:
    "写真に複数の顔が含まれています。1人のみ写った写真を使用してください。",
  low_quality:
    "画像が不鮮明です。より鮮明な写真をお試しください。",
};

export function getErrorMessage(code: string | null): string {
  if (!code) return "";
  return ERROR_MESSAGES[code] ?? "エラーが発生しました。別の写真でお試しください。";
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function roundAngles(a: { yaw: number; pitch: number; roll: number }) {
  return { yaw: round1(a.yaw), pitch: round1(a.pitch), roll: round1(a.roll) };
}

export async function analyzeImages(
  before: File,
  after: File
): Promise<AnalysisResult> {
  const [bResult, aResult, bBright, aBright] = await Promise.all([
    analyzeImageFile(before),
    analyzeImageFile(after),
    measureBrightness(before),
    measureBrightness(after),
  ]);

  const brightness_diff =
    bBright > 0 ? round1(((aBright - bBright) / bBright) * 100) : 0;

  const partial_detection = bResult.partial || aResult.partial;

  if (!bResult.angles || !aResult.angles) {
    // Face not fully detected (profile shots, single body-part photos, etc.)
    // Still return brightness, zero out angles, and flag as partial.
    return {
      yaw_diff: 0,
      pitch_diff: 0,
      roll_diff: 0,
      brightness_diff,
      before_angles: bResult.angles ? roundAngles(bResult.angles) : { yaw: 0, pitch: 0, roll: 0 },
      after_angles:  aResult.angles ? roundAngles(aResult.angles) : { yaw: 0, pitch: 0, roll: 0 },
      partial_detection: true,
      error: null,
    };
  }

  return {
    yaw_diff:        round1(aResult.angles.yaw   - bResult.angles.yaw),
    pitch_diff:      round1(aResult.angles.pitch - bResult.angles.pitch),
    roll_diff:       round1(aResult.angles.roll  - bResult.angles.roll),
    brightness_diff,
    before_angles:   roundAngles(bResult.angles),
    after_angles:    roundAngles(aResult.angles),
    partial_detection,
    error: null,
  };
}
