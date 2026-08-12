import { toBucketCdnUrl } from "@/lib/bucket/cdn"
import { downloadFileBlob } from "@/services/bucket/bucket"
import type { Identity } from "@icp-sdk/core/agent"

/** Rewrite legacy gateway links, then prefer cloud.icpay.app when configured. */
export function normalizePublicFileUrl(url: string): string {
  return toBucketCdnUrl(url)
}

/** CDN first (when public), then authenticated canister download — same fallback as preview. */
export async function fetchBucketFileBlob(opts: {
  publicUrl: string | null
  identity: Identity | undefined
  bucketId: string
  path: string
  contentType: string
}): Promise<Blob> {
  const { publicUrl, identity, bucketId, path, contentType } = opts

  if (publicUrl) {
    try {
      const res = await fetch(publicUrl)
      if (res.ok) {
        const blob = await res.blob()
        if (blob.size > 0) return blob
      }
    } catch {
      // fall through to canister
    }
  }

  if (!identity) throw new Error("Download failed")
  const bytes = await downloadFileBlob(identity, bucketId, path)
  return new Blob([new Uint8Array(bytes)], { type: contentType })
}

export function bytesToObjectUrl(bytes: Uint8Array, contentType: string): string {
  const copy = new Uint8Array(bytes)
  const blob = new Blob([copy], { type: contentType || "application/octet-stream" })
  return URL.createObjectURL(blob)
}

export function revokeObjectUrl(url: string | null | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
}

export function isSvgContentType(contentType: string): boolean {
  return contentType.includes("svg")
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
