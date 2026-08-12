import { WALLET_CANISTER_ID } from "@/services/icp"

/** Production CDN host — proxied by Vercel to the canister /cloud/ route. */
export const BUCKET_CDN_ORIGIN = "https://cloud.icpay.app"

const LEGACY_GATEWAY =
  /^https:\/\/a4gq6-oaaaa-aaaab-qaa4q-cai\.raw\.icp0\.io(\/cloud\/[^?]+)\?id=6vbhm-nqaaa-aaaan-q6muq-cai/

const RAW_CLOUD_RE = new RegExp(
  `^https://(?:[a-z0-9-]+\\.)?raw\\.icp0\\.io/cloud/([^?#]+)`
)

/** When set, public bucket links use cloud.icpay.app instead of *.raw.icp0.io. */
export function getBucketCdnBase(): string | null {
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    // Local dev always uses the canister raw host — cloud.icpay.app is prod-only.
    if (host === "localhost" || host === "127.0.0.1") return null
    if (host === "icpay.app" || host === "www.icpay.app") return BUCKET_CDN_ORIGIN
  }

  const explicit = process.env.NEXT_PUBLIC_BUCKET_CDN_URL
  if (explicit !== undefined) {
    const trimmed = explicit.trim()
    return trimmed ? trimmed.replace(/\/$/, "") : null
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").toLowerCase()
  if (site.includes("icpay.app")) return BUCKET_CDN_ORIGIN

  return null
}

function rawCloudTail(url: string): string | null {
  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) return legacy[1].replace(/^\/cloud\//, "")

  const raw = url.match(RAW_CLOUD_RE)
  if (raw) return raw[1]

  if (url.startsWith(`${BUCKET_CDN_ORIGIN}/`)) {
    return url.slice(BUCKET_CDN_ORIGIN.length + 1)
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

export function resolvePublicFileUrl(url: string, mode: BucketUrlMode = "cdn"): string {
  const raw = toRawCanisterUrl(url)
  if (mode === "raw") return raw
  const tail = rawCloudTail(raw)
  if (tail) {
    const cdnBase = getBucketCdnBase() ?? BUCKET_CDN_ORIGIN
    return `${cdnBase}/${tail}`
  }
  return raw
}

/** Map a canister raw URL (or legacy gateway URL) to the clean CDN host when enabled. */
export function toBucketCdnUrl(url: string): string {
  const cdnBase = getBucketCdnBase()
  const tail = rawCloudTail(url)
  if (cdnBase && tail) return `${cdnBase}/${tail}`

  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) {
    return `https://${WALLET_CANISTER_ID}.raw.icp0.io${legacy[1]}`
  }
  return url
}

export function bucketCdnBaseUrl(bucketName: string): string {
  const cdnBase = getBucketCdnBase()
  if (cdnBase) return `${cdnBase}/${bucketName}`
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}`
}

export function bucketCdnFileUrl(bucketName: string, path: string): string {
  const filePath = path.startsWith("/") ? path : `/${path}`
  const cdnBase = getBucketCdnBase()
  if (cdnBase) {
    const file = filePath.startsWith("/") ? filePath.slice(1) : filePath
    return `${cdnBase}/${bucketName}/${file}`
  }
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}${filePath}`
}
