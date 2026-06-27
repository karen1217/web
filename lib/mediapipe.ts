import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// VIDEO mode landmarker — used by CameraCapture for live preview
let landmarker: FaceLandmarker | null = null;

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;

  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate: "GPU",
    },
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });

  return landmarker;
}

// IMAGE mode landmarker — used for static photo analysis
let imageLandmarker: FaceLandmarker | null = null;

async function getImageFaceLandmarker(): Promise<FaceLandmarker> {
  if (imageLandmarker) return imageLandmarker;

  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  imageLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate: "CPU",
    },
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
    runningMode: "IMAGE",
    numFaces: 1,
  });

  return imageLandmarker;
}

export async function analyzeImageFile(
  file: File
): Promise<{ angles: FaceAngles | null; partial: boolean }> {
  const landmarkerInst = await getImageFaceLandmarker();
  const bitmap = await createImageBitmap(file);

  let result: FaceLandmarkerResult;
  try {
    result = landmarkerInst.detect(bitmap);
  } finally {
    bitmap.close();
  }

  // Best case: use the 3-D transformation matrix
  const matrixAngles = extractAngles(result);
  if (matrixAngles) return { angles: matrixAngles, partial: false };

  // Fallback: estimate from 2-D landmark positions.
  // Handles profile shots / partial-face photos where the matrix is unavailable.
  const lms = result.faceLandmarks?.[0];
  if (lms && lms.length >= 468) {
    const estimated = estimateAnglesFromLandmarks(lms);
    if (estimated) return { angles: estimated, partial: true };
  }

  // No face detected at all (solo body-part photos etc.)
  return { angles: null, partial: true };
}

export interface FaceAngles {
  yaw:   number; // positive = turning right
  pitch: number; // positive = tilting up
  roll:  number; // positive = tilting head right
}

// Extract Euler angles from MediaPipe's column-major 4×4 facial transformation matrix.
// MediaPipe uses OpenGL convention (Z-forward), column-major storage.
//   m[0..3]  = col0, m[4..7]  = col1, m[8..11] = col2, m[12..15] = col3
// Rotation part (upper-left 3×3 in row-major notation):
//   R = | m[0]  m[4]  m[8]  |
//       | m[1]  m[5]  m[9]  |
//       | m[2]  m[6]  m[10] |
// YXZ decomposition: yaw = atan2(m[8], m[10]), pitch = asin(-m[9]), roll = atan2(m[1], m[5])
export function extractAngles(result: FaceLandmarkerResult): FaceAngles | null {
  const matrices = result.facialTransformationMatrixes;
  if (!matrices || matrices.length === 0) return null;

  const m = matrices[0].data;
  if (!m || m.length < 16) return null;

  const yaw   = Math.atan2(m[8],  m[10]) * (180 / Math.PI);
  const pitch = Math.asin(Math.max(-1, Math.min(1, -m[9]))) * (180 / Math.PI);
  const roll  = Math.atan2(m[1],  m[5])  * (180 / Math.PI);

  return { yaw, pitch, roll };
}

// Estimate angles from 2-D landmark coordinates when the 3-D matrix is unavailable.
// Uses nose tip (1), left-eye outer corner (33), right-eye outer corner (263).
// Accuracy is lower than the matrix method — suitable for profile/partial-face comparison
// where consistency between two photos matters more than absolute accuracy.
function estimateAnglesFromLandmarks(lms: NormalizedLandmark[]): FaceAngles | null {
  const leftEye  = lms[33];   // left eye outer corner
  const rightEye = lms[263];  // right eye outer corner
  const noseTip  = lms[1];    // nose tip

  const eyeSpanX = rightEye.x - leftEye.x;
  const eyeSpanY = rightEye.y - leftEye.y;
  const eyeSpan  = Math.sqrt(eyeSpanX * eyeSpanX + eyeSpanY * eyeSpanY);

  if (eyeSpan < 0.02) return null;

  // Yaw: nose position relative to eye-line center (0.5 = frontal, >0.5 = turned right)
  const noseRatio = (noseTip.x - leftEye.x) / (eyeSpanX || eyeSpan);
  const yaw = (noseRatio - 0.5) * 130;

  // Roll: tilt angle of the eye line from horizontal
  const roll = Math.atan2(eyeSpanY, eyeSpanX) * (180 / Math.PI);

  // Pitch: vertical offset of nose tip from eye midpoint, normalized by face size
  const eyeMidY    = (leftEye.y + rightEye.y) / 2;
  const pitchRatio = (noseTip.y - eyeMidY) / eyeSpan;
  // For a frontal face, nose tip sits ~1.3 eye-spans below the eye corners
  const pitch = -(pitchRatio - 1.3) * 45;

  return {
    yaw:   Math.round(yaw   * 10) / 10,
    pitch: Math.round(pitch * 10) / 10,
    roll:  Math.round(roll  * 10) / 10,
  };
}
