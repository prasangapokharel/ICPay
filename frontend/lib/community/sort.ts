import { isCommunityPaid, type CommunityChannelPublic } from "@/services/community/community"

export type CommunitySort = "newest" | "members" | "freeFirst"

export function sortCommunityChannels(
  channels: CommunityChannelPublic[],
  sort: CommunitySort
): CommunityChannelPublic[] {
  const copy = [...channels]
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => Number(b.createdAt - a.createdAt))
    case "members":
      return copy.sort((a, b) => Number(b.memberCount - a.memberCount))
    case "freeFirst":
      return copy.sort((a, b) => {
        const aPaid = isCommunityPaid(a.access) ? 1 : 0
        const bPaid = isCommunityPaid(b.access) ? 1 : 0
        if (aPaid !== bPaid) return aPaid - bPaid
        return Number(b.memberCount - a.memberCount)
      })
    default:
      return copy
  }
}
