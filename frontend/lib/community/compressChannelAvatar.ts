export const CHANNEL_AVATAR_MAX_BYTES = 10_000
export const CHANNEL_AVATAR_EDGE = 256

export class ChannelAvatarError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ChannelAvatarError"
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ChannelAvatarError("Could not read image"))
    }
    img.src = url
  })
}

function squareCropSize(width: number, height: number): { sx: number; sy: number; size: number } {
  const size = Math.min(width, height)
  return {
    sx: Math.floor((width - size) / 2),
    sy: Math.floor((height - size) / 2),
    size,
  }
}

async function encodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality)
  })
}

function hasWebpHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
}

export async function compressChannelAvatar(file: File): Promise<Uint8Array> {
  if (!file.type.startsWith("image/")) {
    throw new ChannelAvatarError("Choose an image file")
  }

  const img = await loadImage(file)
  const crop = squareCropSize(img.naturalWidth || img.width, img.naturalHeight || img.height)

  let edge = CHANNEL_AVATAR_EDGE
  while (edge >= 64) {
    const canvas = document.createElement("canvas")
    canvas.width = edge
    canvas.height = edge
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new ChannelAvatarError("Could not process image")

    ctx.drawImage(img, crop.sx, crop.sy, crop.size, crop.size, 0, 0, edge, edge)

    for (let quality = 0.85; quality >= 0.35; quality -= 0.1) {
      const blob = await encodeWebp(canvas, quality)
      if (!blob) continue
      if (blob.size > CHANNEL_AVATAR_MAX_BYTES) continue

      const bytes = new Uint8Array(await blob.arrayBuffer())
      if (!hasWebpHeader(bytes)) continue
      return bytes
    }

    edge = Math.floor(edge * 0.75)
  }

  throw new ChannelAvatarError("Photo must be under 10 KB — try a simpler image")
}
