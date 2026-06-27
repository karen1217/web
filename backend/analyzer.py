"""
Face angle and brightness analyzer using 3DDFA_V2.

3DDFA_V2 must be cloned into the same directory as this file:
  git clone https://github.com/cleardusk/3DDFA_V2 --depth=1
  cd 3DDFA_V2
  sh ./build.sh
"""

import sys
import os
import gc
import logging
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)

TDDFA_DIR = os.path.join(os.path.dirname(__file__), "3DDFA_V2")
if TDDFA_DIR not in sys.path:
    sys.path.insert(0, TDDFA_DIR)


class _LazyAnalyzer:
    """Load 3DDFA_V2 once on first use to keep startup fast."""

    def __init__(self):
        self._tddfa = None
        self._face_boxes = None

    def _ensure_loaded(self):
        if self._tddfa is not None:
            return

        try:
            import yaml
            from FaceBoxes import FaceBoxes
            from TDDFA import TDDFA
        except ImportError as exc:
            raise RuntimeError(
                "3DDFA_V2 is not installed. "
                "Clone https://github.com/cleardusk/3DDFA_V2 into backend/3DDFA_V2 "
                "and run 'sh ./build.sh' inside it."
            ) from exc

        cfg_path = os.path.join(TDDFA_DIR, "configs", "mb1_120x120.yml")
        with open(cfg_path) as f:
            cfg = yaml.safe_load(f)

        # 3DDFA_V2 uses relative paths (configs/, weights/) so we must run from its directory
        _prev_cwd = os.getcwd()
        try:
            os.chdir(TDDFA_DIR)
            self._tddfa = TDDFA(gpu_mode=False, **cfg)
            self._face_boxes = FaceBoxes()
        finally:
            os.chdir(_prev_cwd)

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

    def _detect_boxes(self, img: np.ndarray) -> tuple[list, bool]:
        """
        Returns (boxes, is_partial).
        is_partial=True means no face was detected and we fell back to
        using the full image region — useful for cropped eye/nose photos.
        """
        boxes = self._face_boxes(img)

        # Multiple faces: keep only the highest-confidence one
        if len(boxes) > 1:
            boxes = sorted(boxes, key=lambda b: b[4], reverse=True)[:1]

        if len(boxes) == 1:
            return boxes, False

        # No face detected → fall back to full-image bounding box.
        # Pad slightly inward so 3DDFA_V2 has room to fit the model.
        h, w = img.shape[:2]
        pad_x = int(w * 0.05)
        pad_y = int(h * 0.05)
        fallback = [[pad_x, pad_y, w - pad_x, h - pad_y, 1.0]]
        logger.info("No face detected; using full-image fallback box (partial mode)")
        return fallback, True

    def analyze_one(self, img_bytes: bytes) -> dict:
        self._ensure_loaded()

        img = self._decode(img_bytes)
        boxes, is_partial = self._detect_boxes(img)

        param_lst, roi_box_lst = self._tddfa(img, boxes)

        from utils.pose import calc_pose
        _, angles = calc_pose(param_lst[0])
        yaw, pitch, roll = float(angles[0]), float(angles[1]), float(angles[2])

        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        brightness = float(np.mean(ycrcb[:, :, 0]))

        del img
        return {
            "yaw": yaw,
            "pitch": pitch,
            "roll": roll,
            "brightness": brightness,
            "partial": is_partial,
        }


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

    try:
        b = _analyzer.analyze_one(before_bytes)
        a = _analyzer.analyze_one(after_bytes)

        partial_detection = b["partial"] or a["partial"]

        before_angles = {"yaw": round(b["yaw"], 1), "pitch": round(b["pitch"], 1), "roll": round(b["roll"], 1)}
        after_angles  = {"yaw": round(a["yaw"], 1), "pitch": round(a["pitch"], 1), "roll": round(a["roll"], 1)}

        yaw_diff        = round(a["yaw"]   - b["yaw"],   1)
        pitch_diff      = round(a["pitch"] - b["pitch"], 1)
        roll_diff       = round(a["roll"]  - b["roll"],  1)
        brightness_diff = _brightness_diff_pct(b["brightness"], a["brightness"])

    except ValueError as exc:
        error_code = str(exc)
        yaw_diff = pitch_diff = roll_diff = brightness_diff = 0.0

    except Exception:
        logger.exception("Unexpected error during face analysis")
        error_code = "analysis_failed"
        yaw_diff = pitch_diff = roll_diff = brightness_diff = 0.0

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
