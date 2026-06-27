/**
 * Client-side brightness helper.
 * Computes mean luminance (Y channel) of an image File using a canvas.
 * Used for optional pre-flight checks before sending to the API.
 */

export async function measureBrightness(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let total = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      // Perceptual luminance (BT.709)
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return total / pixels; // 0–255
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compress a File to stay under maxMB using canvas quality reduction.
 * Returns the original file if already within limit.
 */
export async function compressIfNeeded(
  file: File,
  maxMB = 5
): Promise<File> {
  const limitBytes = maxMB * 1024 * 1024;
  if (file.size <= limitBytes) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);

    let w = img.naturalWidth;
    let h = img.naturalHeight;

    // Scale down proportionally until pixel count fits
    while (w * h > 4_000_000) {
      w = Math.round(w * 0.85);
      h = Math.round(h * 0.85);
    }

    const canvas = document.createElement("canvas");
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);

    for (let q = 0.9; q >= 0.3; q -= 0.1) {
      const blob = await canvasToBlob(canvas, "image/jpeg", q);
      if (blob.size <= limitBytes) {
        const name = file.name.replace(/\.[^.]+$/, "") + "_compressed.jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }

    // Fallback: return lowest quality
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.3);
    return new File([blob], file.name, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}
