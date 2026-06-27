const API_BASE = "/api";

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
  Backend_unavailable:
    "サーバーが準備中です（初回起動に最大60秒かかります）。しばらくしてから再度お試しください。",
};

export function getErrorMessage(code: string | null): string {
  if (!code) return "";
  return ERROR_MESSAGES[code] ?? "エラーが発生しました。別の写真でお試しください。";
}

export async function analyzeImages(
  before: File,
  after: File
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("before", before);
  form.append("after", after);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<AnalysisResult>;
}
