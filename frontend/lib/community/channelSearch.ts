import type { CommunityChannelPublic } from "@/services/community/community"

const CHANNEL_SLUG_RE = /^[a-z0-9_]{3,32}$/

export function parseChannelSearchSlug(raw: string): string | null {
  let query = raw.trim().toLowerCase()
  if (!query) return null

  if (query.startsWith("@")) {
    query = query.slice(1)
  }

  const pathMatch = query.match(/(?:^|\/)channels\/(?:join\/)?([^/?#]+)/)
  if (pathMatch?.[1]) {
    try {
      query = decodeURIComponent(pathMatch[1]).toLowerCase()
    } catch {
      query = pathMatch[1].toLowerCase()
    }
  }

  if (query.includes("://")) {
    try {
      const url = new URL(query.startsWith("http") ? query : `https://${query}`)
      const fromPath = url.pathname.match(/\/channels\/(?:join\/)?([^/]+)/)?.[1]
      if (fromPath) {
        query = decodeURIComponent(fromPath).toLowerCase()
      }
    } catch {
      return null
    }
  }

  return CHANNEL_SLUG_RE.test(query) ? query : null
}

export function channelMatchesQuery(
  channel: Pick<CommunityChannelPublic, "name" | "slug">,
  query: string
): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const slugNeedle = parseChannelSearchSlug(needle) ?? needle
  const hayName = channel.name.toLowerCase()
  const haySlug = channel.slug.toLowerCase()

  return hayName.includes(needle) || haySlug.includes(slugNeedle)
}

export function mergeChannelLookup(
  channels: CommunityChannelPublic[],
  lookedUp: CommunityChannelPublic | null | undefined
): CommunityChannelPublic[] {
  if (!lookedUp) return channels
  if (channels.some((ch) => ch.slug === lookedUp.slug)) return channels
  return [lookedUp, ...channels]
}
