"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  CHANNEL_AVATAR_CACHE_EVENT,
  getChannelAvatarSnapshot,
} from "@/lib/community/channelAvatarCache"

export function useCommunityChannelAvatar(slug: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onChange = (event: Event) => {
        const detail = (event as CustomEvent<{ slug: string }>).detail
        if (detail?.slug === slug) onStoreChange()
      }
      window.addEventListener(CHANNEL_AVATAR_CACHE_EVENT, onChange)
      return () => window.removeEventListener(CHANNEL_AVATAR_CACHE_EVENT, onChange)
    },
    [slug]
  )

  return useSyncExternalStore(
    subscribe,
    () => (slug ? getChannelAvatarSnapshot(slug) : undefined),
    () => undefined
  )
}
