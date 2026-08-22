"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { usePageVisible } from "@/hooks/live/usePageVisible"
import { LIVE_PEER_SYNC_MS } from "@/lib/live/timing"
import { dedupeLivePeers } from "@/lib/live/peers"
import { listLivePeers } from "@/services/live/live"

export const livePeersKey = (principal: string, roomId: string) =>
  ["live-peers", roomId, principal] as const

const keyFor = (identity: { getPrincipal(): { toText(): string } } | undefined, roomId: string) =>
  identity ? livePeersKey(identity.getPrincipal().toText(), roomId) : null

export function useLivePeers(roomId: string, enabled: boolean, selfTabId: string) {
  const { identity } = useAuth()
  const pageVisible = usePageVisible()
  const active = enabled && pageVisible

  const { data, error, mutate } = useSWR(
    active && identity ? keyFor(identity, roomId) : null,
    () => listLivePeers(identity, roomId),
    {
      refreshInterval: active ? LIVE_PEER_SYNC_MS : 0,
      revalidateOnFocus: active,
      revalidateOnMount: true,
      dedupingInterval: 1_000,
      keepPreviousData: true,
    }
  )

  const peers = useMemo(
    () => (data ? dedupeLivePeers(data, selfTabId) : []),
    [data, selfTabId]
  )

  const peerKey = useMemo(
    () => peers.map((p) => p.tabId).sort().join("\0"),
    [peers]
  )

  return { peers, peerKey, error, refresh: mutate }
}
