"""
Face angle and brightness analyzer using MediaPipe FaceLandmarker (Tasks API).

Replaces the previous 3DDFA_V2 backend — same JSON interface, no heavy build step.
The face_landmarker.task model (~25 MB) is downloaded on first startup and cached.
"""

import gc
import logging
import math
import os
import urllib.request
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "face_landmarker.task")
MODEL_URL  = (
    "https://storage.googleapis.com/mediapipe-models/"
    "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)


def _download_model() -> None:
    if os.path.exists(MODEL_PATH):
        return
    logger.info("Downloading face_landmarker.task (~25 MB) …")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    logger.info("Model ready at %s", MODEL_PATH)


class _LazyAnalyzer:
    """Load MediaPipe FaceLandmarker once on first use to keep startup fast."""

    def __init__(self):
        self._landmarker = None
        self._mp = None

    def _ensure_loaded(self):
        if self._landmarker is not None:
            return
        _download_model()

        import mediapipe as mp
        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision

        base_options = mp_python.BaseOptions(
            model_asset_path=MODEL_PATH,
            delegate=mp_python.BaseOptions.Delegate.CPU,
        )
        options = mp_vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=True,
            num_faces=1,
            running_mode=mp_vision.RunningMode.IMAGE,
            min_face_detection_confidence=0.3,
        )
        self._landmarker = mp_vision.FaceLandmarker.create_from_options(options)
        self._mp = mp

    def _decode(self, img_bytes: bytes) -> np.ndarray:
        arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("low_quality")
        h, w = img.shape[:2]
        if max(h, w) > 1920:
            scale = 1920 / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        return img

    def _run_landmarker(self, img_rgb: np.ndarray):
        mp_image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=img_rgb)
        result = self._landmarker.detect(mp_image)
        logger.info(
            "Detection: faces=%d matrices=%d shape=%s",
            len(result.face_landmarks),
            len(result.facial_transformation_matrixes),
            img_rgb.shape,
        )
        return result

    def analyze_one(self, img_bytes: bytes) -> dict:
        self._ensure_loaded()

        img_bgr = self._decode(img_bytes)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        result = self._run_landmarker(img_rgb)

        # If no face found, try upscaling the image (helps on CPU with small/dim faces)
        if not result.face_landmarks:
            h, w = img_rgb.shape[:2]
            scale = min(2.0, 1920 / max(h, w)) if max(h, w) < 960 else 1.5
            up = cv2.resize(img_rgb, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
            result2 = self._run_landmarker(up)
            if result2.face_landmarks:
                result = result2

        # Primary: transformation matrix (most accurate, frontal + mild profile)
        angles = self._extract_angles(result)
        partial = angles is None

        # Fallback 1: estimate from 2-D MediaPipe landmarks
        if angles is None:
            angles = self._estimate_from_landmarks(result)

        # Fallback 2: YuNet DNN detector (handles frontal + profile on CPU)
        if angles is None:
            angles = self._estimate_from_yunet(img_bgr)

        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        brightness = float(np.mean(ycrcb[:, :, 0]))

        del img_bgr, img_rgb
        return {
            "yaw":        angles["yaw"]   if angles else 0.0,
            "pitch":      angles["pitch"] if angles else 0.0,
            "roll":       angles["roll"]  if angles else 0.0,
            "brightness": brightness,
            "partial":    partial and (angles is None),
        }

    @staticmethod
    def _extract_angles(result) -> Optional[dict]:
        """Extract Euler angles from MediaPipe's 4×4 facial transformation matrix.

        Column-major storage, YXZ decomposition — identical to the JS extractAngles():
          yaw   = atan2(m[8],  m[10])
          pitch = asin(-m[9])
          roll  = atan2(m[1],  m[5])
        """
        if not result.facial_transformation_matrixes:
            return None
        m = result.facial_transformation_matrixes[0].data
        if len(m) < 16:
            return None
        yaw   = math.atan2(m[8],  m[10]) * 180 / math.pi
        pitch = math.asin(max(-1.0, min(1.0, float(-m[9])))) * 180 / math.pi
        roll  = math.atan2(m[1],  m[5])  * 180 / math.pi
        return {"yaw": yaw, "pitch": pitch, "roll": roll}

    @staticmethod
    def _estimate_from_landmarks(result) -> Optional[dict]:
        """Rough angle estimate from 2-D landmark coords when the matrix is unavailable."""
        if not result.face_landmarks:
            return None
        lms = result.face_landmarks[0]
        if len(lms) < 468:
            return None

        left_eye  = lms[33]   # left eye outer corner
        right_eye = lms[263]  # right eye outer corner
        nose_tip  = lms[1]    # nose tip

        eye_span_x = right_eye.x - left_eye.x
        eye_span_y = right_eye.y - left_eye.y
        eye_span   = math.sqrt(eye_span_x ** 2 + eye_span_y ** 2)
        if eye_span < 0.02:
            return None

        nose_ratio  = (nose_tip.x - left_eye.x) / (eye_span_x or eye_span)
        yaw         = (nose_ratio - 0.5) * 130
        roll        = math.atan2(eye_span_y, eye_span_x) * 180 / math.pi
        eye_mid_y   = (left_eye.y + right_eye.y) / 2
        pitch_ratio = (nose_tip.y - eye_mid_y) / eye_span
        pitch       = -(pitch_ratio - 1.3) * 45

        return {"yaw": yaw, "pitch": pitch, "roll": roll}

    @staticmethod
    def _estimate_from_yunet(img_bgr: np.ndarray) -> Optional[dict]:
        """Detect face with YuNet DNN (handles frontal + profile) and estimate angles."""
        model_path = os.path.join(os.path.dirname(__file__), "yunet.onnx")
        if not os.path.exists(model_path):
            logger.warning("yunet.onnx not found, skipping YuNet detection")
            return None

        h, w = img_bgr.shape[:2]

        # Try multiple input sizes — larger helps with profile detection
        for input_size in [(w, h), (640, 640), (320, 320)]:
            try:
                detector = cv2.FaceDetectorYN.create(
                    model_path, "", input_size,
                    score_threshold=0.4,
                    nms_threshold=0.3,
                )
                img_resized = cv2.resize(img_bgr, input_size) if input_size != (w, h) else img_bgr
                _, faces = detector.detect(img_resized)
                if faces is not None and len(faces) > 0:
                    # Scale keypoints back to original image size
                    sx = w / input_size[0]
                    sy = h / input_size[1]
                    face = faces[0]
                    # YuNet keypoints: right_eye, left_eye, nose, right_mouth, left_mouth
                    kps = face[4:14].reshape(5, 2)
                    kps[:, 0] *= sx
                    kps[:, 1] *= sy

                    right_eye, left_eye, nose, right_mouth, left_mouth = kps

                    eye_dx = float(left_eye[0] - right_eye[0])
                    eye_dy = float(left_eye[1] - right_eye[1])
                    eye_dist = math.sqrt(eye_dx**2 + eye_dy**2)

                    face_w = float(face[2]) * sx
                    if face_w < 1:
                        continue

                    # Yaw: eye separation relative to face width
                    # Frontal → ~0.55 × face_w apart; Profile → eyes overlap
                    separation_ratio = eye_dx / face_w
                    clamped = max(-1.0, min(1.0, separation_ratio / 0.55))
                    yaw_sign = -1.0 if eye_dx < 0 else 1.0
                    yaw = yaw_sign * math.acos(abs(clamped)) * 180 / math.pi

                    # Roll: angle of the eye line from horizontal
                    roll = math.atan2(eye_dy, eye_dx + 1e-6) * 180 / math.pi

                    # Pitch: nose below/above eye midpoint relative to face height
                    eye_mid_y = (right_eye[1] + left_eye[1]) / 2
                    face_h = float(face[3]) * sy
                    pitch_ratio = (float(nose[1]) - eye_mid_y) / max(face_h, 1)
                    pitch = -(pitch_ratio - 0.3) * 80

                    logger.info(
                        "YuNet: yaw=%.1f pitch=%.1f roll=%.1f eye_dx=%.1f face_w=%.1f",
                        yaw, pitch, roll, eye_dx, face_w,
                    )
                    return {"yaw": round(yaw, 1), "pitch": round(pitch, 1), "roll": round(roll, 1)}
            except Exception as e:
                logger.warning("YuNet attempt failed: %s", e)
                continue

        return None


_analyzer = _LazyAnalyzer()


def _brightness_diff_pct(b_val: float, a_val: float) -> float:
    if b_val <= 0:
        return 0.0
    return round((a_val - b_val) / b_val * 100, 1)


def analyze_images(before_bytes: bytes, after_bytes: bytes) -> dict:
    error_code: Optional[str] = None
    partial_detection = False
    before_angles = {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}
    after_angles   = {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}
    yaw_diff = pitch_diff = roll_diff = brightness_diff = 0.0

    try:
        b = _analyzer.analyze_one(before_bytes)
        a = _analyzer.analyze_one(after_bytes)

        partial_detection = b["partial"] or a["partial"]

        before_angles = {k: round(b[k], 1) for k in ("yaw", "pitch", "roll")}
        after_angles  = {k: round(a[k], 1) for k in ("yaw", "pitch", "roll")}

        yaw_diff        = round(a["yaw"]   - b["yaw"],   1)
        pitch_diff      = round(a["pitch"] - b["pitch"], 1)
        roll_diff       = round(a["roll"]  - b["roll"],  1)
        brightness_diff = _brightness_diff_pct(b["brightness"], a["brightness"])

    except ValueError as exc:
        error_code = str(exc)

    except Exception as exc:
        logger.exception("Unexpected error during face analysis")
        error_code = f"analysis_failed:{type(exc).__name__}:{exc}"

    finally:
        del before_bytes, after_bytes
        gc.collect()

    return {
        "yaw_diff":          yaw_diff,
        "pitch_diff":        pitch_diff,
        "roll_diff":         roll_diff,
        "brightness_diff":   brightness_diff,
        "before_angles":     before_angles,
        "after_angles":      after_angles,
        "partial_detection": partial_detection,
        "error":             error_code,
    }
