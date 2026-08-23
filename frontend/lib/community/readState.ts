const PREFIX = "icpay-community"

type LatestCache = { id: string; at: string }

function seenKey(principal: string, slug: string) {
  return `${PREFIX}-seen-${principal}-${slug}`
}

function latestKey(slug: string) {
  return `${PREFIX}-latest-${slug}`
}

export function cacheLatestMessage(slug: string, messageId: bigint, createdAt: bigint) {
  if (typeof window === "undefined") return
  const payload: LatestCache = { id: messageId.toString(), at: createdAt.toString() }
  localStorage.setItem(latestKey(slug), JSON.stringify(payload))
}

export function getCachedLatest(slug: string): LatestCache | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(latestKey(slug))
  if (!raw) return null
  try {
    return JSON.parse(raw) as LatestCache
  } catch {
    return null
  }
}

export function markChannelRead(principal: string, slug: string, messageId: bigint) {
  if (typeof window === "undefined") return
  localStorage.setItem(seenKey(principal, slug), messageId.toString())
}

export function hasUnread(principal: string, slug: string): boolean {
  const latest = getCachedLatest(slug)
  if (!latest) return false
  if (typeof window === "undefined") return false
  const seen = localStorage.getItem(seenKey(principal, slug))
  if (!seen) return true
  try {
    return BigInt(latest.id) > BigInt(seen)
  } catch {
    return false
  }
}
