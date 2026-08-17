"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { getLiveRoom } from "@/services/live/live"

export const liveRoomKey = (roomId: string) => ["live-room", roomId] as const

export function useLiveRoom(roomId: string, poll = false) {
  const { identity } = useAuth()

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    identity && roomId ? liveRoomKey(roomId) : null,
    () => getLiveRoom(identity, roomId),
    {
      refreshInterval: poll ? 5000 : 0,
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 800,
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
