import { WALLET_CANISTER_ID } from "@/services/icp"

/** Production CDN host — proxied by Vercel to the canister /cloud/ route. */
export const BUCKET_CDN_ORIGIN = "https://cloud.icpay.app"

const LEGACY_GATEWAY =
  /^https:\/\/a4gq6-oaaaa-aaaab-qaa4q-cai\.raw\.icp0\.io(\/cloud\/[^?]+)\?id=6vbhm-nqaaa-aaaan-q6muq-cai/

const RAW_CLOUD_RE = new RegExp(
  `^https://(?:[a-z0-9-]+\\.)?raw\\.icp0\\.io/cloud/([^?#]+)`
)

/**
 * CDN base for bucket URLs. Opt-in via NEXT_PUBLIC_BUCKET_CDN_URL; the default
 * is the raw canister host. Setting the env to a URL enables cloud.icpay.app
 * (or any custom CDN), and empty disables it explicitly.
 */
export function getBucketCdnBase(): string | null {
  const explicit = process.env.NEXT_PUBLIC_BUCKET_CDN_URL
  if (explicit !== undefined) {
    const trimmed = explicit.trim()
    return trimmed ? trimmed.replace(/\/$/, "") : null
  }
  return null
}

function rawCloudTail(url: string): string | null {
  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) return legacy[1].replace(/^\/cloud\//, "")

  const raw = url.match(RAW_CLOUD_RE)
  if (raw) return raw[1]

  if (url.startsWith(`${BUCKET_CDN_ORIGIN}/cloud/`)) {
    return url.slice(BUCKET_CDN_ORIGIN.length + "/cloud/".length)
  }

  return null
}

/** Map any bucket URL form to the canister raw /cloud/ URL. */
export function toRawCanisterUrl(url: string): string {
  const tail = rawCloudTail(url)
  if (tail) return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${tail}`

  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) {
    return `https://${WALLET_CANISTER_ID}.raw.icp0.io${legacy[1]}`
  }
  return url
}

export type BucketUrlMode = "cdn" | "raw"

/** Resolve a bucket URL to the raw canister host by default, or the CDN host. */
export function resolvePublicFileUrl(url: string, mode: BucketUrlMode = "raw"): string {
  const raw = toRawCanisterUrl(url)
  if (mode === "raw") return raw
  const tail = rawCloudTail(raw)
  if (tail) {
    const cdnBase = getBucketCdnBase()
    if (cdnBase) return `${cdnBase}/cloud/${tail}`
  }
  return raw
}

/** CDN base for a bucket, e.g. https://cloud.icpay.app/cloud/{bucketName}. */
export function bucketCdnBaseUrl(bucketName: string): string {
  const cdnBase = getBucketCdnBase()
  if (cdnBase) return `${cdnBase}/cloud/${bucketName}`
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}`
}

/** CDN URL for a file, e.g. https://cloud.icpay.app/cloud/{bucketName}{path}. */
export function bucketCdnFileUrl(bucketName: string, path: string): string {
  const filePath = path.startsWith("/") ? path : `/${path}`
  const cdnBase = getBucketCdnBase()
  if (cdnBase) return `${cdnBase}/cloud/${bucketName}${filePath}`
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}${filePath}`
}