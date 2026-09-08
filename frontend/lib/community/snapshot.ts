import type {
  CommunityAccess,
  CommunityChannelPublic,
  CommunityVisibility,
} from "@/services/community/community"

export type CommunityChannelSnapshot = {
  id: string
  name: string
  slug: string
  owner: string
  ownerUsername: [] | [string]
  bio: string
  visibility: CommunityVisibility
  access: CommunityAccess
  priceE8s: string
  memberCount: string
  createdAt: string
  pinnedMessageId: [] | [string]
}

export function toCommunityChannelSnapshot(
  channel: CommunityChannelPublic
): CommunityChannelSnapshot {
  return {
    id: channel.id,
    name: channel.name,
    slug: channel.slug,
    owner: channel.owner.toText(),
    ownerUsername: channel.ownerUsername,
    bio: channel.bio,
    visibility: channel.visibility,
    access: channel.access,
    priceE8s: channel.priceE8s.toString(),
    memberCount: channel.memberCount.toString(),
    createdAt: channel.createdAt.toString(),
    pinnedMessageId:
      channel.pinnedMessageId[0] !== undefined
        ? [channel.pinnedMessageId[0].toString()]
        : [],
  }
}
