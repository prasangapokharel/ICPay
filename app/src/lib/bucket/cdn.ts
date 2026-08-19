import { WALLET_CANISTER_ID } from '@/services/icp'

export const BUCKET_CDN_ORIGIN = 'https://cloud.icpay.app'

const LEGACY_GATEWAY =
  /^https:\/\/a4gq6-oaaaa-aaaab-qaa4q-cai\.raw\.icp0\.io(\/cloud\/[^?]+)\?id=6vbhm-nqaaa-aaaan-q6muq-cai/

const RAW_CLOUD_RE = new RegExp(`^https://(?:[a-z0-9-]+\\.)?raw\\.icp0\\.io/cloud/([^?#]+)`)

export function getBucketCdnBase(): string | null {
  const explicit = process.env.EXPO_PUBLIC_BUCKET_CDN_URL ?? process.env.NEXT_PUBLIC_BUCKET_CDN_URL
  if (explicit === undefined) return null
  const trimmed = explicit.trim()
  return trimmed ? trimmed.replace(/\/$/, '') : null
}

function rawCloudTail(url: string): string | null {
  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) return legacy[1].replace(/^\/cloud\//, '')
  const raw = url.match(RAW_CLOUD_RE)
  if (raw) return raw[1]
  if (url.startsWith(`${BUCKET_CDN_ORIGIN}/cloud/`)) {
    return url.slice(BUCKET_CDN_ORIGIN.length + '/cloud/'.length)
  }
  return null
}

export function toRawCanisterUrl(url: string): string {
  const tail = rawCloudTail(url)
  if (tail) return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${tail}`
  const legacy = url.match(LEGACY_GATEWAY)
  if (legacy) return `https://${WALLET_CANISTER_ID}.raw.icp0.io${legacy[1]}`
  return url
}

export function resolvePublicFileUrl(url: string, mode: 'cdn' | 'raw' = 'raw'): string {
  const raw = toRawCanisterUrl(url)
  if (mode === 'raw') return raw
  const tail = rawCloudTail(raw)
  const cdnBase = getBucketCdnBase()
  if (tail && cdnBase) return `${cdnBase}/cloud/${tail}`
  return raw
}
