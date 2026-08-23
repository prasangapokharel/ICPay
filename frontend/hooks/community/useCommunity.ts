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
  deleteCommunityMessage,
  getCommunityChannel,
  isCommunityMember,
  listCommunityMessages,
  listMyCommunityChannels,
  listPublicCommunityChannels,
  setCommunityMessageReaction,
} from "@/services/community/community"
import { applyReactionTap, mergeReactionUpdate, type ReactionCode } from "@/lib/community/reactions"
import type { CommunityMessagePublic } from "@/services/community/community"

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

export function useCommunityDeleteMessage(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (messageId: bigint) => {
      if (!identity) throw new Error("Not signed in")

      const key = communityMessagesKey(identity, slug)
      let snapshot: CommunityMessagePublic[] | undefined

      await mutate(
        key,
        (current: CommunityMessagePublic[] | undefined = []) => {
          snapshot = current
          return current.filter((message) => message.id !== messageId)
        },
        { revalidate: false }
      )

      try {
        await deleteCommunityMessage(identity, slug, messageId)
      } catch (error) {
        await mutate(key, snapshot, { revalidate: false })
        throw error
      }
    },
    [identity, slug, mutate]
  )
}

export function useCommunityReaction(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (messageId: bigint, code: ReactionCode) => {
      if (!identity) throw new Error("Not signed in")

      const key = communityMessagesKey(identity, slug)
      let snapshot: CommunityMessagePublic[] | undefined

      await mutate(
        key,
        (current: CommunityMessagePublic[] | undefined = []) => {
          snapshot = current
          return current.map((message: CommunityMessagePublic) =>
            message.id === messageId
              ? { ...message, ...applyReactionTap(message, code) }
              : message
          )
        },
        { revalidate: false }
      )

      try {
        const result = await setCommunityMessageReaction(identity, slug, messageId, code)
        await mutate(
          key,
          (current: CommunityMessagePublic[] | undefined = []) =>
            current.map((message: CommunityMessagePublic) =>
              message.id === messageId ? mergeReactionUpdate(message, result) : message
            ),
          { revalidate: false }
        )
      } catch (error) {
        await mutate(key, snapshot, { revalidate: false })
        throw error
      }
    },
    [identity, slug, mutate]
  )
}
