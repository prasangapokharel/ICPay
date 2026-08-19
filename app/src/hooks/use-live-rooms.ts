import useSWR from 'swr'
import { useAuth } from '@/components/auth/auth-provider'
import { listPublicLiveRooms } from '@/services/live/live'

export function useLiveRooms() {
  const { identity } = useAuth()
  const { data, isLoading, mutate } = useSWR(
    identity ? (['live-rooms', identity.getPrincipal().toText()] as const) : null,
    () => listPublicLiveRooms(identity),
    { revalidateOnFocus: true, keepPreviousData: true, dedupingInterval: 8_000 },
  )

  return {
    rooms: data ?? [],
    isLoading: Boolean(isLoading && !data),
    refresh: mutate,
  }
}
