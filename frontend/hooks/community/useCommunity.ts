"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { syncChannelAvatarCache } from "@/lib/community/channelAvatarCache"
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
  pinCommunityMessage,
  postCommunityMessage,
  setCommunityChannelAvatar,
  setCommunityMessageReaction,
  type CommunityChannelPublic,
} from "@/services/community/community"
import { applyReactionTap, mergeReactionUpdate, type ReactionCode } from "@/lib/community/reactions"
import type { CommunityMessagePublic } from "@/services/community/community"

const QUERY_OPTS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 30_000,
} as const

export function useInvalidateCommunity() {
  const { mutate } = useSWRConfig()
  const { identity } = useAuth()

  return useCallback(async () => {
    if (!identity) return
    const p = identity.getPrincipal().toText()
    await mutate(
      (key) =>
        Array.isArray(key) &&
        typeof key[0] === "string" &&
        key[0].startsWith("community-") &&
        key.includes(p)
    )
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

export function useCommunityPostMessage(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (text: string) => {
      if (!identity) throw new Error("Not signed in")

      const key = communityMessagesKey(identity, slug)
      const posted = await postCommunityMessage(identity, slug, text)

      await mutate(
        key,
        (current: CommunityMessagePublic[] | undefined = []) => {
          if (current.some((message) => message.id === posted.id)) return current
          return [...current, posted]
        },
        { revalidate: false }
      )

      return posted
    },
    [identity, slug, mutate]
  )
}

export function useCommunityPinMessage(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (messageId: bigint) => {
      if (!identity) throw new Error("Not signed in")

      const channelKey = communityChannelKey(identity, slug)
      if (!channelKey) throw new Error("Not signed in")

      await mutate(
        channelKey,
        async () => {
          const updated = await pinCommunityMessage(identity, slug, messageId)
          return updated
        },
        {
          optimisticData: (current: CommunityChannelPublic | null | undefined) => {
            if (!current) return current ?? null
            return { ...current, pinnedMessageId: [messageId] as [bigint] }
          },
          rollbackOnError: true,
          revalidate: false,
        }
      )
    },
    [identity, slug, mutate]
  )
}

export function useCommunityDeleteMessage(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (messageId: bigint) => {
      if (!identity) throw new Error("Not signed in")

      const key = communityMessagesKey(identity, slug)

      await mutate(
        key,
        async (current: CommunityMessagePublic[] | undefined = []) => {
          await deleteCommunityMessage(identity, slug, messageId)
          return current.filter((message) => message.id !== messageId)
        },
        {
          optimisticData: (current: CommunityMessagePublic[] | undefined = []) =>
            current.filter((message) => message.id !== messageId),
          rollbackOnError: true,
          revalidate: false,
        }
      )
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

      await mutate(
        key,
        async (current: CommunityMessagePublic[] | undefined = []) => {
          const result = await setCommunityMessageReaction(identity, slug, messageId, code)
          return current.map((message) =>
            message.id === messageId ? mergeReactionUpdate(message, result) : message
          )
        },
        {
          optimisticData: (current: CommunityMessagePublic[] | undefined = []) =>
            current.map((message) =>
              message.id === messageId
                ? { ...message, ...applyReactionTap(message, code) }
                : message
            ),
          rollbackOnError: true,
          revalidate: false,
        }
      )
    },
    [identity, slug, mutate]
  )
}

export function useCommunitySetChannelAvatar(slug: string) {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (avatar: Uint8Array | null) => {
      if (!identity) throw new Error("Not signed in")

      const channelKey = communityChannelKey(identity, slug)
      if (!channelKey) throw new Error("Not signed in")

      const updated = await setCommunityChannelAvatar(identity, slug, avatar)
      syncChannelAvatarCache(slug, avatar)

      await mutate(channelKey, updated, { revalidate: false })
      await mutate(communityPublicListKey(identity))
      await mutate(communityMineKey(identity))

      return null
    },
    [identity, slug, mutate]
  )
}
