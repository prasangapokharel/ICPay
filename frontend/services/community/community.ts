import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { call, query, unwrap, type Outcome } from "@/services/client"

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
}

export type CommunityMessagePublic = {
  id: bigint
  author: Principal
  authorUsername: [] | [string]
  text: string
  createdAt: bigint
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

export function ownerHandle(channel: CommunityChannelPublic): string {
  const u = channel.ownerUsername[0]
  return u ? `@${u}` : channel.owner.toText().slice(0, 8) + "…"
}

export async function listPublicCommunityChannels(
  identity: Identity | undefined,
  limit = 30,
  offset = 0
): Promise<CommunityChannelPublic[]> {
  return query(identity, async (actor) =>
    actor.listPublicCommunityChannels(BigInt(limit), BigInt(offset)) as Promise<CommunityChannelPublic[]>
  )
}

export async function listMyCommunityChannels(
  identity: Identity | undefined
): Promise<CommunityChannelPublic[]> {
  return query(identity, async (actor) => {
    const result = (await actor.listMyCommunityChannels()) as Outcome<CommunityChannelPublic[]>
    return unwrap(result)
  })
}

export async function getCommunityChannel(
  identity: Identity | undefined,
  channelId: string
): Promise<CommunityChannelPublic | null> {
  return query(identity, async (actor) => {
    const r = (await actor.getCommunityChannel(channelId)) as [] | [CommunityChannelPublic]
    return r.length ? r[0] : null
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
    return unwrap(result)
  })
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
  return unwrap(outcome)
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
