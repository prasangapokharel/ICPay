export const DEFAULT_WALLPAPER_ID = 1

export const WALLPAPER_THEMES = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12] as const

export type WallpaperThemeId = (typeof WALLPAPER_THEMES)[number]
export type WallpaperId = 0 | WallpaperThemeId

const PREFIX = "icpay-community-wallpaper"

export function wallpaperKey(slug: string) {
  return `${PREFIX}-${slug}`
}

export function isWallpaperId(value: number): value is WallpaperId {
  if (value === 0) return true
  return (WALLPAPER_THEMES as readonly number[]).includes(value)
}

export function wallpaperUrl(id: WallpaperId): string {
  const fileId = id === 0 ? DEFAULT_WALLPAPER_ID : id
  return `/images/community/bg-option/${fileId}.png`
}

export function getWallpaperId(slug: string): WallpaperId {
  if (typeof window === "undefined") return 0
  const raw = localStorage.getItem(wallpaperKey(slug))
  if (raw === null) return 0
  const n = Number(raw)
  if (!isWallpaperId(n)) return 0
  return n
}

export function setWallpaperId(slug: string, id: WallpaperId) {
  if (typeof window === "undefined") return
  localStorage.setItem(wallpaperKey(slug), String(id))
  window.dispatchEvent(
    new CustomEvent("community-wallpaper", { detail: { slug, id } satisfies { slug: string; id: WallpaperId } })
  )
}

export const WALLPAPER_EVENT = "community-wallpaper"

export const WALLPAPER_OPTIONS: WallpaperId[] = [0, ...WALLPAPER_THEMES]
