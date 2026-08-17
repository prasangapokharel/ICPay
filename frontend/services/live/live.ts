import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { call, query, unwrap, type Outcome } from "@/services/client"

export type LiveVisibility = { open: null } | { inviteOnly: null }
export type LiveState = { draft: null } | { live: null } | { paused: null } | { ended: null }

export type LiveRoomPublic = {
  id: string
  title: string
  host: Principal
  hostUsername: [] | [string]
  visibility: LiveVisibility
  state: LiveState
  peerCount: bigint
  createdAt: bigint
}

export type LivePeer = {
  tabId: string
  principal: Principal
  joinedAt: bigint
}

export type LiveSignal = {
  id: bigint
  fromTab: string
  toTab: [] | [string]
  payload: string
}

export type LiveCreateResult = {
  roomId: string
  inviteToken: [] | [string]
}

export function liveStateLabel(state: LiveState): "draft" | "live" | "paused" | "ended" {
  if ("draft" in state) return "draft"
  if ("live" in state) return "live"
  if ("paused" in state) return "paused"
  return "ended"
}

export function isLivePublic(v: LiveVisibility): boolean {
  return "open" in v
}

export async function listPublicLiveRooms(
  identity: Identity | undefined,
  limit = 20,
  offset = 0
): Promise<LiveRoomPublic[]> {
  return query(identity, async (actor) =>
    actor.listPublicLiveRooms(BigInt(limit), BigInt(offset)) as Promise<LiveRoomPublic[]>
  )
}

export async function getLiveRoom(
  identity: Identity | undefined,
  roomId: string
): Promise<LiveRoomPublic | null> {
  return query(identity, async (actor) => {
    const r = (await actor.getLiveRoom(roomId)) as [] | [LiveRoomPublic]
    return r.length ? r[0] : null
  })
}

export async function listLivePeers(
  identity: Identity | undefined,
  roomId: string
): Promise<LivePeer[]> {
  return query(identity, async (actor) => actor.listLivePeers(roomId) as Promise<LivePeer[]>)
}

export async function createLiveRoom(
  identity: Identity | undefined,
  title: string,
  visibility: LiveVisibility,
  inviteSecret?: string
): Promise<LiveCreateResult> {
  const outcome = await call(identity, "Could not create room", async (actor) =>
    actor.createLiveRoom(title, visibility, inviteSecret ? [inviteSecret] : []) as Promise<
      Outcome<LiveCreateResult>
    >
  )
  return unwrap(outcome)
}

export async function joinLiveRoom(
  identity: Identity | undefined,
  roomId: string,
  tabId: string,
  inviteToken?: string
): Promise<LiveRoomPublic> {
  const outcome = await call(identity, "Could not join room", async (actor) =>
    actor.joinLiveRoom(roomId, tabId, inviteToken ? [inviteToken] : []) as Promise<
      Outcome<LiveRoomPublic>
    >
  )
  return unwrap(outcome)
}

export async function leaveLiveRoom(
  identity: Identity | undefined,
  roomId: string,
  tabId: string
): Promise<void> {
  const outcome = await call(identity, "Could not leave room", async (actor) =>
    actor.leaveLiveRoom(roomId, tabId) as Promise<Outcome<null>>
  )
  unwrap(outcome)
}

export async function startLiveRoom(
  identity: Identity | undefined,
  roomId: string
): Promise<LiveRoomPublic> {
  const outcome = await call(identity, "Could not start room", async (actor) =>
    actor.startLiveRoom(roomId) as Promise<Outcome<LiveRoomPublic>>
  )
  return unwrap(outcome)
}

export async function pauseLiveRoom(
  identity: Identity | undefined,
  roomId: string
): Promise<LiveRoomPublic> {
  const outcome = await call(identity, "Could not pause room", async (actor) =>
    actor.pauseLiveRoom(roomId) as Promise<Outcome<LiveRoomPublic>>
  )
  return unwrap(outcome)
}

export async function resumeLiveRoom(
  identity: Identity | undefined,
  roomId: string
): Promise<LiveRoomPublic> {
  const outcome = await call(identity, "Could not resume room", async (actor) =>
    actor.resumeLiveRoom(roomId) as Promise<Outcome<LiveRoomPublic>>
  )
  return unwrap(outcome)
}

export async function endLiveRoom(
  identity: Identity | undefined,
  roomId: string
): Promise<void> {
  const outcome = await call(identity, "Could not end room", async (actor) =>
    actor.endLiveRoom(roomId) as Promise<Outcome<null>>
  )
  unwrap(outcome)
}

export async function postLiveSignal(
  identity: Identity | undefined,
  roomId: string,
  tabId: string,
  toTab: string | null,
  payload: string
): Promise<bigint> {
  const outcome = await call(identity, "Signal failed", async (actor) =>
    actor.postLiveSignal(roomId, tabId, toTab ? [toTab] : [], payload) as Promise<Outcome<bigint>>
  )
  return unwrap(outcome)
}

export async function pollLiveSignals(
  identity: Identity | undefined,
  roomId: string,
  tabId: string,
  afterId: bigint
): Promise<LiveSignal[]> {
  return query(identity, async (actor) => {
    const outcome = (await actor.pollLiveSignals(roomId, tabId, afterId)) as Outcome<LiveSignal[]>
    return unwrap(outcome)
  })
}
