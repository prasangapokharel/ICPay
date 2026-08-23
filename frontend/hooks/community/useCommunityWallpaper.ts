"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  getWallpaperId,
  setWallpaperId,
  WALLPAPER_EVENT,
  WALLPAPER_OPTIONS,
  wallpaperUrl,
  type WallpaperId,
} from "@/lib/community/wallpaper"

export function useCommunityWallpaper(slug: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onChange = (event: Event) => {
        const detail = (event as CustomEvent<{ slug: string; id: WallpaperId }>).detail
        if (detail?.slug === slug) onStoreChange()
      }
      window.addEventListener(WALLPAPER_EVENT, onChange)
      return () => window.removeEventListener(WALLPAPER_EVENT, onChange)
    },
    [slug]
  )

  const wallpaperId = useSyncExternalStore(
    subscribe,
    () => getWallpaperId(slug),
    () => 0 as WallpaperId
  )

  const select = useCallback(
    (id: WallpaperId) => {
      setWallpaperId(slug, id)
    },
    [slug]
  )

  return {
    wallpaperId,
    wallpaperUrl: wallpaperUrl(wallpaperId),
    selectWallpaper: select,
    options: WALLPAPER_OPTIONS,
  }
}
