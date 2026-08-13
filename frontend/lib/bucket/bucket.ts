export const CAPACITY_TIERS_GB = [1, 5, 10, 25, 50, 100, 250, 500] as const

export const FILES_PAGE_SIZE = 20

export {
  BUCKET_MAX_FILE_BYTES,
  BUCKET_MAX_FILE_BYTES as MAX_FILE_BYTES,
} from "@/lib/bucket/upload-chunk"

export {
  buildFileAcceptList,
  guessFileMime,
  fileTypeChip,
  normalizeUploadFile,
} from "@/lib/bucket/allowed-files"

import {
  buildFileAcceptList,
  guessFileMime,
  isAllowedUpload as isAllowedByExtension,
  fileTypeChip,
} from "@/lib/bucket/allowed-files"
import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/upload-chunk"

export const FILE_ACCEPT = buildFileAcceptList()

/** @deprecated use guessFileMime */
export const guessImageMime = guessFileMime

type BucketErrorKey =
  | "errInvalidFormat"
  | "errPhotoProcess"
  | "errIngressTooLarge"
  | "invalidFile"
  | "errVideoBlocked"
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
    err.includes("too large") ||
    err.includes("2097152") ||
    err.includes("max allowed") ||
    err.includes("chunked upload") ||
    err.includes("Upload session") ||
    err.includes("Upload incomplete")
  ) {
    return t("errIngressTooLarge")
  }
  if (err.includes("Could not process this photo")) return t("errPhotoProcess")
  if (
    err.includes("Only images allowed") ||
    err.includes("Invalid file format") ||
    err.includes("upload WebP images") ||
    err.includes("upload images, txt, py, or zip") ||
    err.includes("Video uploads are not allowed") ||
    err.includes("File type not allowed")
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

export {
  sanitizeUploadFilename,
  uploadPathForFile,
  replacePathExtension,
  buildUploadPath,
} from "@/lib/bucket/upload-path"

export function isImageUploadFile(file: File): boolean {
  return guessFileMime(file).startsWith("image/")
}

/** @deprecated use isImageUploadFile */
export const isRasterImageFile = isImageUploadFile

export function isAllowedUpload(file: File): boolean {
  return isAllowedByExtension(file, BUCKET_MAX_FILE_BYTES)
}

/** @deprecated use isAllowedUpload */
export const isAllowedImage = isAllowedUpload

export function expiresAtToMs(expiresAt: bigint): number {
  return Number(expiresAt / 1_000_000n)
}

export function optionalText(value: [] | [string]): string | null {
  return value.length === 0 ? null : value[0]
}

/** @deprecated use fileTypeChip from allowed-files */
export const imageTypeChip = fileTypeChip
