import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

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
