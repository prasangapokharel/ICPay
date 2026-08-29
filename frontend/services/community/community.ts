import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { call, query, unwrap, type Outcome } from "@/services/client"
import { syncChannelAvatarCache } from "@/lib/community/channelAvatarCache"
import { getWalletActor } from "@/services/wallet"

export type CommunityVisibility = { open: null } | { inviteOnly: null }
export type CommunityAccess = { free: null } | { paid: null }

export type CommunityChannelPublic = {
  id: string
  name: string
  slug: string
  owner: Principal
  ownerUsername: [] | [string]
  bio: string
  visibility: CommunityVisibility
  access: CommunityAccess
  priceE8s: bigint
  pinnedMessageId: [] | [bigint]
  memberCount: bigint
  createdAt: bigint
  channelAvatar: [] | [Uint8Array]
}

export type CommunityMessagePublic = {
  id: bigint
  author: Principal
  authorUsername: [] | [string]
  text: string
  createdAt: bigint
  reactions: CommunityReactionCount[]
  myReaction: [] | [bigint]
}

export type CommunityReactionCount = {
  code: bigint
  count: bigint
}

export type CommunityReactionUpdate = {
  messageId: bigint
  myReaction: [] | [bigint]
  reactions: CommunityReactionCount[]
}

export type CommunityCreateResult = {
  channelId: string
  inviteCode: [] | [string]
}

export function isCommunityOpen(v: CommunityVisibility): boolean {
  return "open" in v
}

export function isCommunityPaid(a: CommunityAccess): boolean {
  return "paid" in a
}

export function ownerHandle(channel: {
  owner: Principal | string
  ownerUsername: [] | [string]
}): string {
  const u = channel.ownerUsername[0]
  const text = typeof channel.owner === "string" ? channel.owner : channel.owner.toText()
  return u ? `@${u}` : text.slice(0, 8) + "…"
}

export async function listPublicCommunityChannels(
  identity: Identity | undefined,
  limit = 30,
  offset = 0
): Promise<CommunityChannelPublic[]> {
  return query(identity, async (actor) => {
    const rows = (await actor.listPublicCommunityChannels(
      BigInt(limit),
      BigInt(offset)
    )) as CommunityChannelPublic[]
    return rows.map(normalizeCommunityChannel)
  })
}

export async function listMyCommunityChannels(
  identity: Identity | undefined
): Promise<CommunityChannelPublic[]> {
  return query(identity, async (actor) => {
    const result = (await actor.listMyCommunityChannels()) as Outcome<CommunityChannelPublic[]>
    return unwrap(result).map(normalizeCommunityChannel)
  })
}

export async function getCommunityChannel(
  identity: Identity | undefined,
  channelId: string
): Promise<CommunityChannelPublic | null> {
  return query(identity, async (actor) => {
    const r = (await actor.getCommunityChannel(channelId)) as [] | [CommunityChannelPublic]
    return r.length ? normalizeCommunityChannel(r[0]) : null
  })
}

export async function listCommunityMessages(
  identity: Identity | undefined,
  channelId: string,
  afterId = 0n,
  limit = 50
): Promise<CommunityMessagePublic[]> {
  return query(identity, async (actor) => {
    const result = (await actor.listCommunityMessages(channelId, afterId, BigInt(limit))) as Outcome<
      CommunityMessagePublic[]
    >
    const rows = unwrap(result)
    return rows.map(normalizeCommunityMessage)
  })
}

function normalizeCommunityMessage(message: CommunityMessagePublic): CommunityMessagePublic {
  return {
    ...message,
    reactions: message.reactions ?? [],
    myReaction: message.myReaction ?? [],
  }
}

function normalizeCommunityChannel(channel: CommunityChannelPublic): CommunityChannelPublic {
  const raw = channel.channelAvatar?.[0]
  const bytes =
    raw && raw.length > 0 ? (raw instanceof Uint8Array ? raw : new Uint8Array(raw)) : null
  syncChannelAvatarCache(channel.slug, bytes)
  return {
    ...channel,
    channelAvatar: [],
  }
}

export async function setCommunityMessageReaction(
  identity: Identity | undefined,
  channelId: string,
  messageId: bigint,
  code: number
): Promise<CommunityReactionUpdate> {
  const outcome = await call(identity, "Could not react", async (actor) =>
    actor.setCommunityMessageReaction(channelId, messageId, code) as Promise<
      Outcome<CommunityReactionUpdate>
    >
  )
  return unwrap(outcome)
}

export async function isCommunityMember(
  identity: Identity | undefined,
  channelId: string
): Promise<boolean> {
  return query(identity, async (actor) => actor.isCommunityMember(channelId))
}

export async function createCommunityChannel(
  identity: Identity | undefined,
  name: string,
  slug: string,
  bio: string,
  visibility: CommunityVisibility,
  access: CommunityAccess,
  priceE8s: bigint,
  inviteSecret?: string
): Promise<CommunityCreateResult> {
  const outcome = await call(identity, "Could not create channel", async (actor) =>
    actor.createCommunityChannel(name, slug, bio, visibility, access, priceE8s, inviteSecret ? [inviteSecret] : []) as Promise<
      Outcome<CommunityCreateResult>
    >
  )
  return unwrap(outcome)
}

export async function joinCommunityChannel(
  identity: Identity | undefined,
  channelId: string,
  inviteCode?: string
): Promise<CommunityChannelPublic> {
  const outcome = await call(identity, "Could not join channel", async (actor) =>
    actor.joinCommunityChannel(channelId, inviteCode ? [inviteCode] : []) as Promise<
      Outcome<CommunityChannelPublic>
    >
  )
  return unwrap(outcome)
}

export async function leaveCommunityChannel(
  identity: Identity | undefined,
  channelId: string
): Promise<void> {
  const outcome = await call(identity, "Could not leave channel", async (actor) =>
    actor.leaveCommunityChannel(channelId) as Promise<Outcome<null>>
  )
  unwrap(outcome)
}

export async function postCommunityMessage(
  identity: Identity | undefined,
  channelId: string,
  text: string
): Promise<CommunityMessagePublic> {
  const outcome = await call(identity, "Could not post message", async (actor) =>
    actor.postCommunityMessage(channelId, text) as Promise<Outcome<CommunityMessagePublic>>
  )
  return normalizeCommunityMessage(unwrap(outcome))
}

export async function pinCommunityMessage(
  identity: Identity | undefined,
  channelId: string,
  messageId: bigint
): Promise<CommunityChannelPublic> {
  const outcome = await call(identity, "Could not pin message", async (actor) =>
    actor.pinCommunityMessage(channelId, messageId) as Promise<Outcome<CommunityChannelPublic>>
  )
  return unwrap(outcome)
}

export async function deleteCommunityMessage(
  identity: Identity | undefined,
  channelId: string,
  messageId: bigint
): Promise<void> {
  const outcome = await call(identity, "Could not delete message", async (actor) =>
    actor.deleteCommunityMessage(channelId, messageId) as Promise<Outcome<null>>
  )
  unwrap(outcome)
}

export async function setCommunityChannelAvatar(
  identity: Identity | undefined,
  channelId: string,
  avatar: Uint8Array | null
): Promise<CommunityChannelPublic> {
  const outcome = await call(identity, "Could not update channel photo", async (actor) =>
    actor.setCommunityChannelAvatar(channelId, avatar ? [avatar] : []) as Promise<
      Outcome<CommunityChannelPublic>
    >
  )
  return normalizeCommunityChannel(unwrap(outcome))
}

async function publicQuery<T>(
  fn: (actor: Awaited<ReturnType<typeof getWalletActor>>) => Promise<T>
): Promise<T> {
  return fn(await getWalletActor(undefined))
}

export async function getPublicCommunityChannel(
  slug: string
): Promise<CommunityChannelPublic | null> {
  try {
    return await publicQuery(async (actor) => {
      const r = (await actor.getCommunityChannel(slug)) as [] | [CommunityChannelPublic]
      return r.length ? normalizeCommunityChannel(r[0]) : null
    })
  } catch {
    return null
  }
}

export async function getPublicCommunityChannelAvatarBytes(
  slug: string
): Promise<Uint8Array | undefined> {
  try {
    return await publicQuery(async (actor) => {
      const r = (await actor.getCommunityChannel(slug)) as [] | [CommunityChannelPublic]
      if (!r.length) return undefined
      const raw = r[0].channelAvatar?.[0]
      if (!raw?.length) return undefined
      return raw instanceof Uint8Array ? raw : new Uint8Array(raw)
    })
  } catch {
    return undefined
  }
}

export async function listPublicChannelsForSeo(
  limit = 50,
  offset = 0
): Promise<CommunityChannelPublic[]> {
  try {
    return await publicQuery(async (actor) => {
      const rows = (await actor.listPublicCommunityChannels(
        BigInt(limit),
        BigInt(offset)
      )) as CommunityChannelPublic[]
      return rows.map(normalizeCommunityChannel)
    })
  } catch {
    return []
  }
}

export async function listAllPublicChannelsForSeo(
  max = 500
): Promise<CommunityChannelPublic[]> {
  const out: CommunityChannelPublic[] = []
  const page = 50
  for (let offset = 0; offset < max; offset += page) {
    const rows = await listPublicChannelsForSeo(page, offset)
    if (rows.length === 0) break
    out.push(...rows)
    if (rows.length < page) break
  }
  return out
}
