export const CAPACITY_TIERS_GB = [1, 5, 10, 25, 50, 100, 250, 500] as const

export const FILES_PAGE_SIZE = 20

export const MAX_FILE_BYTES = 10_000_000

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.png,.jpg,.jpeg,.gif,.webp,.svg"

export const DOCUMENT_ACCEPT = "text/plain,.txt,.py,text/x-python,application/zip,.zip"

export const FILE_ACCEPT = `${IMAGE_ACCEPT},${DOCUMENT_ACCEPT}`

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg)$/i
const DOC_EXT_RE = /\.(txt|py|zip)$/i

export function guessFileMime(file: File): string {
  const type = file.type.trim().toLowerCase()
  if (type === "image/x-png") return "image/png"
  if (type === "image/jpg") return "image/jpeg"
  if (type.startsWith("image/")) return type
  if (type === "text/x-python" || type === "application/x-python-code") {
    return "text/x-python"
  }
  if (type === "application/x-zip-compressed") return "application/zip"
  if (type === "text/plain" || type === "application/zip") return type

  const name = file.name.toLowerCase()
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg"
  if (name.endsWith(".gif")) return "image/gif"
  if (name.endsWith(".webp")) return "image/webp"
  if (name.endsWith(".svg")) return "image/svg+xml"
  if (name.endsWith(".txt")) return "text/plain"
  if (name.endsWith(".py")) return "text/x-python"
  if (name.endsWith(".zip")) return "application/zip"
  return type
}

/** @deprecated use guessFileMime */
export const guessImageMime = guessFileMime

type BucketErrorKey =
  | "errInvalidFormat"
  | "invalidFile"
  | "errStorageLimit"
  | "errBucketExpired"
  | "errPermissionDenied"
  | "errRateLimit"
  | "errNameTaken"

export function mapBucketError(
  err: string,
  t: (key: BucketErrorKey) => string
): string {
  if (
    err.includes("Only images allowed") ||
    err.includes("Invalid file format") ||
    err.includes("upload WebP images") ||
    err.includes("upload images, txt, py, or zip")
  ) {
    return t("errInvalidFormat")
  }
  if (err.includes("File too large")) return t("invalidFile")
  if (err.includes("Storage limit")) return t("errStorageLimit")
  if (err.includes("expired")) return t("errBucketExpired")
  if (err.includes("name already taken")) return t("errNameTaken")
  if (err.includes("Permission denied") || err.includes("Access denied")) {
    return t("errPermissionDenied")
  }
  if (err.includes("Rate limit") || err.includes("Too many")) return t("errRateLimit")
  return err
}

export type BucketVisibilityVariant =
  | { Public: null }
  | { Private: null }

export type BucketStatusVariant = { ACTIVE: null } | { EXPIRED: null }

export function isPublicVisibility(v: BucketVisibilityVariant): boolean {
  return "Public" in v
}

export function isBucketActive(status: BucketStatusVariant): boolean {
  return "ACTIVE" in status
}

export function formatBytes(bytes: bigint | number): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

export function formatUsageLabel(used: bigint, capacity: bigint): string {
  return `${formatBytes(used)} / ${formatBytes(capacity)}`
}

export function capacityGbFromBytes(capacity: bigint): number {
  return Number(capacity / 1_000_000_000n)
}

export function validateBucketName(name: string): string | null {
  const t = name.trim().toLowerCase()
  if (t.length < 3) return "Name must be at least 3 characters"
  if (t.length > 32) return "Name must be at most 32 characters"
  if (!/^[a-z0-9-]+$/.test(t)) {
    return "Use lowercase letters, digits, and hyphens only"
  }
  return null
}

/** CDN object path at bucket root — no /uploads/ folder segment. */
export function uploadPathForFile(file: File): string {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase()
  return `/${Date.now()}-${safe}`
}

export function replacePathExtension(path: string, ext: string): string {
  const slash = path.lastIndexOf("/")
  const base = slash >= 0 ? path.slice(slash + 1) : path
  const dot = base.lastIndexOf(".")
  const stem = dot >= 0 ? path.slice(0, slash + 1 + dot) : path
  return `${stem}${ext.startsWith(".") ? ext : `.${ext}`}`
}

export function isImageUploadFile(file: File): boolean {
  return guessFileMime(file).startsWith("image/")
}

/** @deprecated use isImageUploadFile */
export const isRasterImageFile = isImageUploadFile

export function isAllowedUpload(file: File): boolean {
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) return false
  const mime = guessFileMime(file)
  if (mime.startsWith("image/")) return true
  if (mime === "text/plain" || mime === "text/x-python" || mime === "application/zip") {
    return true
  }
  return IMAGE_EXT_RE.test(file.name) || DOC_EXT_RE.test(file.name)
}

/** @deprecated use isAllowedUpload */
export const isAllowedImage = isAllowedUpload

export function expiresAtToMs(expiresAt: bigint): number {
  return Number(expiresAt / 1_000_000n)
}

export function optionalText(value: [] | [string]): string | null {
  return value.length === 0 ? null : value[0]
}

export function fileTypeChip(contentType: string): string {
  if (contentType.includes("png")) return "PNG"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "JPG"
  if (contentType.includes("webp")) return "WEBP"
  if (contentType.includes("gif")) return "GIF"
  if (contentType.includes("svg")) return "SVG"
  if (contentType.includes("python") || contentType.endsWith("py")) return "PY"
  if (contentType.includes("zip")) return "ZIP"
  if (contentType.includes("plain") || contentType.includes("text")) return "TXT"
  if (contentType.startsWith("image/")) return "IMG"
  return "FILE"
}

/** @deprecated use fileTypeChip */
export const imageTypeChip = fileTypeChip
