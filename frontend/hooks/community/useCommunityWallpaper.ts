"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getWallpaperId,
  setWallpaperId,
  WALLPAPER_EVENT,
  WALLPAPER_OPTIONS,
  wallpaperUrl,
  type WallpaperId,
} from "@/lib/community/wallpaper"

export function useCommunityWallpaper(slug: string) {
  const [wallpaperId, setId] = useState<WallpaperId>(0)

  useEffect(() => {
    setId(getWallpaperId(slug))
  }, [slug])

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ slug: string; id: WallpaperId }>).detail
      if (detail?.slug === slug) setId(detail.id)
    }
    window.addEventListener(WALLPAPER_EVENT, onChange)
    return () => window.removeEventListener(WALLPAPER_EVENT, onChange)
  }, [slug])

  const select = useCallback(
    (id: WallpaperId) => {
      setWallpaperId(slug, id)
      setId(id)
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
