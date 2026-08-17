"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { usePageVisible } from "@/hooks/use-page-visible"
import { LIVE_ROOM_POLL_MS } from "@/lib/live-webrtc"
import { getLiveRoom } from "@/services/live/live"

export const liveRoomKey = (roomId: string) => ["live-room", roomId] as const

export function useLiveRoom(roomId: string, poll = false) {
  const { identity } = useAuth()
  const pageVisible = usePageVisible()
  const active = poll && pageVisible

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    identity && roomId ? liveRoomKey(roomId) : null,
    () => getLiveRoom(identity, roomId),
    {
      refreshInterval: active ? LIVE_ROOM_POLL_MS : 0,
      revalidateOnFocus: active,
      revalidateOnMount: true,
      dedupingInterval: 2_000,
      keepPreviousData: true,
    }
  )

  return {
    room: data ?? null,
    error,
    isLoading: data === undefined && (isLoading || isValidating),
    mutate,
  }
}
