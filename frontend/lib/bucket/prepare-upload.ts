import {
  guessFileMime,
  isImageUploadFile,
  replacePathExtension,
  uploadPathForFile,
} from "@/lib/bucket/bucket"

/** Target size for images after WebP conversion (1 MB). */
export const TARGET_WEBP_BYTES = 1_000_000

/** Default canvas size when an SVG has no intrinsic dimensions. */
const SVG_FALLBACK_PX = 1024

export type PreparedUpload = {
  file: File
  path: string
  contentType: string
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("WebP encode failed"))),
      "image/webp",
      quality
    )
  })
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Image decode failed"))
    img.src = src
  })
}

async function decodeUploadImage(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  const mime = guessFileMime(file)
  if (mime.includes("svg")) {
    const url = URL.createObjectURL(file)
    try {
      const img = await loadHtmlImage(url)
      const width = img.naturalWidth > 0 ? img.naturalWidth : SVG_FALLBACK_PX
      const height = img.naturalHeight > 0 ? img.naturalHeight : SVG_FALLBACK_PX
      return { source: img, width, height }
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  const bitmap = await createImageBitmap(file)
  return { source: bitmap, width: bitmap.width, height: bitmap.height }
}

async function convertImageToWebp(file: File): Promise<File> {
  const { source, width: startW, height: startH } = await decodeUploadImage(file)
  let width = startW
  let height = startH
  let quality = 0.92

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")

  while (true) {
    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(source, 0, 0, width, height)

    let blob = await canvasToWebp(canvas, quality)
    if (blob.size <= TARGET_WEBP_BYTES) {
      const base = file.name.replace(/\.[^.]+$/, "") || "upload"
      return new File([blob], `${base}.webp`, { type: "image/webp" })
    }

    if (quality > 0.52) {
      quality -= 0.08
      continue
    }

    width = Math.max(256, Math.floor(width * 0.85))
    height = Math.max(256, Math.floor(height * 0.85))
    quality = 0.72

    if (width <= 256 && height <= 256) {
      blob = await canvasToWebp(canvas, 0.5)
      const base = file.name.replace(/\.[^.]+$/, "") || "upload"
      return new File([blob], `${base}.webp`, { type: "image/webp" })
    }
  }
}

/** Prepare a file for upload — all images (incl. SVG) become WebP ≤ 1 MB. */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  if (isImageUploadFile(file)) {
    const converted = await convertImageToWebp(file)
    const path = replacePathExtension(uploadPathForFile(converted), ".webp")
    return { file: converted, path, contentType: "image/webp" }
  }

  const contentType = guessFileMime(file)
  const path = uploadPathForFile(file)
  return { file, path, contentType }
}
