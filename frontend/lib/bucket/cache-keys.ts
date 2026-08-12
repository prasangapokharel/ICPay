import type { Identity } from "@icp-sdk/core/agent"

/** SWR cache keys — principal suffix prevents cross-account bleed. */
export function bucketListKey(identity: Identity | undefined) {
  return identity ? (["bucket-list", identity.getPrincipal().toText()] as const) : null
}

export function bucketStatsKey(identity: Identity | undefined, bucketId: string) {
  return identity ? (["bucket-stats", bucketId, identity.getPrincipal().toText()] as const) : null
}

export function bucketFilesKey(identity: Identity | undefined, bucketId: string, page: number) {
  return identity
    ? (["bucket-files", bucketId, String(page), identity.getPrincipal().toText()] as const)
    : null
}

export function bucketPriceKey(identity: Identity | undefined, capacityGB: number) {
  return identity
    ? (["bucket-price", String(capacityGB), identity.getPrincipal().toText()] as const)
    : null
}

export function bucketRenewQuoteKey(identity: Identity | undefined, bucketId: string) {
  return identity
    ? (["bucket-renew-quote", bucketId, identity.getPrincipal().toText()] as const)
    : null
}

export function bucketCycleKey(identity: Identity | undefined) {
  return identity ? (["bucket-cycle-status", identity.getPrincipal().toText()] as const) : null
}

export function bucketApiKeysKey(identity: Identity | undefined, bucketId: string) {
  return identity
    ? (["bucket-api-keys", bucketId, identity.getPrincipal().toText()] as const)
    : null
}

export function bucketFilePreviewKey(
  identity: Identity | undefined,
  bucketId: string,
  path: string
) {
  return identity
    ? (["bucket-file-preview", bucketId, path, identity.getPrincipal().toText()] as const)
    : null
}

export function isBucketCacheKey(key: unknown, identity: Identity | undefined): boolean {
  if (!identity || !Array.isArray(key)) return false
  const principal = identity.getPrincipal().toText()
  if (key[key.length - 1] !== principal) return false
  const head = key[0]
  return (
    head === "bucket-list" ||
    head === "bucket-stats" ||
    head === "bucket-files" ||
    head === "bucket-price" ||
    head === "bucket-renew-quote" ||
    head === "bucket-cycle-status" ||
    head === "bucket-file-preview" ||
    head === "bucket-api-keys"
  )
}
