import logging
import os

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from analyzer import analyze_images

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Photo Checker API")

# ---------------------------------------------------------------------------
# CORS – localhost only (all production traffic comes via Next.js proxy)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

_MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB hard limit server-side


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    before: UploadFile = File(..., description="Before photo"),
    after:  UploadFile = File(..., description="After photo"),
):
    before_data = await before.read()
    after_data  = await after.read()

    if len(before_data) > _MAX_FILE_BYTES or len(after_data) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB per image)")

    try:
        result = analyze_images(before_data, after_data)
    except Exception as exc:
        logger.exception("Unhandled error in analyze endpoint")
        return JSONResponse(content={"error": f"analyze_failed:{exc}"}, status_code=500)
    return JSONResponse(content=result)


@app.post("/inpaint")
async def inpaint(
    image: UploadFile = File(..., description="Original photo"),
    mask:  UploadFile = File(..., description="B/W mask – white = inpaint"),
):
    img_data  = await image.read()
    mask_data = await mask.read()

    if len(img_data) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large")

    img_np  = np.frombuffer(img_data,  np.uint8)
    mask_np = np.frombuffer(mask_data, np.uint8)

    img  = cv2.imdecode(img_np,  cv2.IMREAD_COLOR)
    mask = cv2.imdecode(mask_np, cv2.IMREAD_GRAYSCALE)

    if img is None or mask is None:
        raise HTTPException(status_code=400, detail="Invalid image or mask")

    # Scale mask to match image dimensions if they differ
    if mask.shape[:2] != img.shape[:2]:
        mask = cv2.resize(mask, (img.shape[1], img.shape[0]),
                          interpolation=cv2.INTER_LINEAR)

    # Binarise mask (any pixel > 10 → 255)
    _, mask = cv2.threshold(mask, 10, 255, cv2.THRESH_BINARY)

    # Dilate slightly so brush edges are fully covered
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.dilate(mask, kernel, iterations=1)

    result = cv2.inpaint(img, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    _, encoded = cv2.imencode(
        ".jpg", result, [cv2.IMWRITE_JPEG_QUALITY, 95]
    )
    return Response(content=encoded.tobytes(), media_type="image/jpeg")
