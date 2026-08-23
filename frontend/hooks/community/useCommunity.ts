"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import {
  communityChannelKey,
  communityMemberKey,
  communityMessagesKey,
  communityMineKey,
  communityPublicListKey,
} from "@/lib/community/cacheKeys"
import {
  getCommunityChannel,
  isCommunityMember,
  listCommunityMessages,
  listMyCommunityChannels,
  listPublicCommunityChannels,
} from "@/services/community/community"

const QUERY_OPTS = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 30_000,
} as const

export function useInvalidateCommunity() {
  const { mutate } = useSWRConfig()
  const { identity } = useAuth()

  return useCallback(async () => {
    if (!identity) return
    const p = identity.getPrincipal().toText()
    await mutate((key) => Array.isArray(key) && typeof key[0] === "string" && key[0].startsWith("community-") && key.includes(p))
  }, [identity, mutate])
}

export function useInvalidateCommunityLists(slug?: string) {
  const { mutate } = useSWRConfig()
  const { identity } = useAuth()

  return useCallback(async () => {
    if (!identity) return
    await Promise.all([
      mutate(communityPublicListKey(identity)),
      mutate(communityMineKey(identity)),
      slug ? mutate(communityChannelKey(identity, slug)) : Promise.resolve(),
    ])
  }, [identity, mutate, slug])
}

export function usePublicCommunityChannels() {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    communityPublicListKey(identity),
    () => listPublicCommunityChannels(identity),
    QUERY_OPTS
  )
  return { channels: data ?? [], error, isLoading, refresh: mutate }
}

export function useMyCommunityChannels() {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    communityMineKey(identity),
    () => listMyCommunityChannels(identity),
    QUERY_OPTS
  )
  return { channels: data ?? [], error, isLoading, refresh: mutate }
}

export function useCommunityChannel(slug: string) {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    communityChannelKey(identity, slug),
    () => getCommunityChannel(identity, slug),
    QUERY_OPTS
  )
  return { channel: data, error, isLoading, refresh: mutate }
}

export function useCommunityMessages(slug: string, enabled: boolean) {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? communityMessagesKey(identity, slug) : null,
    () => listCommunityMessages(identity, slug, 0n, 50),
    QUERY_OPTS
  )
  return { messages: data ?? [], error, isLoading, refresh: mutate }
}

export function useCommunityMembership(slug: string) {
  const { identity } = useAuth()
  const { data, mutate } = useSWR(
    communityMemberKey(identity, slug),
    () => isCommunityMember(identity, slug),
    QUERY_OPTS
  )
  return { isMember: data ?? false, refresh: mutate, mutate }
}
