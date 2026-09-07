import { cacheLife } from "next/cache"
import { isChannelIndexable } from "@/lib/community/seo"
import {
  toCommunityChannelSnapshot,
  type CommunityChannelSnapshot,
} from "@/lib/community/snapshot"
import {
  getPublicCommunityChannel,
  getPublicCommunityChannelAvatarBytes,
  listAllPublicChannelsForSeo,
} from "@/services/community/community"

export async function getCachedPublicChannelSnapshot(
  slug: string
): Promise<CommunityChannelSnapshot | null> {
  "use cache"
  cacheLife("default")
  const channel = await getPublicCommunityChannel(slug)
  return channel ? toCommunityChannelSnapshot(channel) : null
}

export async function getCachedPublicChannelAvatar(
  slug: string
): Promise<Uint8Array | undefined> {
  "use cache"
  cacheLife("default")
  return await getPublicCommunityChannelAvatarBytes(slug)
}

export async function listCachedIndexableChannelSnapshots(): Promise<
  CommunityChannelSnapshot[]
> {
  "use cache"
  cacheLife("default")
  const channels = await listAllPublicChannelsForSeo()
  return channels.map(toCommunityChannelSnapshot).filter(isChannelIndexable)
}
