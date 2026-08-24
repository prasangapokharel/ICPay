const PREFIX = "icpay-community-avatar"

export const CHANNEL_AVATAR_CACHE_EVENT = "community-avatar-cache"

export function channelAvatarCacheKey(slug: string) {
  return `${PREFIX}:${slug}`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(encoded: string): Uint8Array | undefined {
  try {
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch {
    return undefined
  }
}

export function getCachedChannelAvatar(slug: string): Uint8Array | undefined {
  if (typeof window === "undefined" || !slug) return undefined
  const raw = localStorage.getItem(channelAvatarCacheKey(slug))
  if (!raw) return undefined
  return base64ToBytes(raw)
}

export function syncChannelAvatarCache(slug: string, bytes: Uint8Array | null | undefined) {
  if (typeof window === "undefined" || !slug) return

  const key = channelAvatarCacheKey(slug)
  if (!bytes?.length) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, bytesToBase64(bytes))
  }

  window.dispatchEvent(
    new CustomEvent(CHANNEL_AVATAR_CACHE_EVENT, { detail: { slug } satisfies { slug: string } })
  )
}
