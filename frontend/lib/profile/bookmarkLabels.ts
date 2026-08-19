const STORAGE_KEY = "icpay:bookmark-labels"

type LabelMap = Record<string, string>

function readMap(): LabelMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as LabelMap
  } catch {
    return {}
  }
}

function writeMap(map: LabelMap) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function cacheBookmarkUsername(targetUserId: string, username: string) {
  const name = username.trim().toLowerCase()
  if (!name) return
  const map = readMap()
  map[targetUserId] = name
  writeMap(map)
}

export function getCachedBookmarkUsername(targetUserId: string): string | null {
  return readMap()[targetUserId] ?? null
}

export function removeCachedBookmarkUsername(targetUserId: string) {
  const map = readMap()
  if (!(targetUserId in map)) return
  delete map[targetUserId]
  writeMap(map)
}
