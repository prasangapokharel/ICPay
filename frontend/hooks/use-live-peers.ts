"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { LiveAudioSession } from "@/lib/live-webrtc"
import { dedupeLivePeers } from "@/lib/live-peers"
import { listLivePeers, type LivePeer } from "@/services/live/live"

const keyFor = (identity: { getPrincipal(): { toText(): string } } | undefined, roomId: string) =>
  identity ? (["live-peers", roomId, identity.getPrincipal().toText()] as const) : null

export function useLivePeers(roomId: string, enabled: boolean, selfTabId: string) {
  const { identity } = useAuth()

  const { data, error, mutate } = useSWR(
    enabled && identity ? keyFor(identity, roomId) : null,
    () => listLivePeers(identity, roomId),
    {
      refreshInterval: LiveAudioSession.peerSyncIntervalMs(),
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 200,
      keepPreviousData: true,
    }
  )

  const peers: LivePeer[] = data ? dedupeLivePeers(data, selfTabId) : []

  return { peers, error, refresh: mutate }
}
