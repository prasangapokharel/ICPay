import { getItem, setItem } from '@/services/storage/kv'

const STORAGE_KEY = 'icpay.bookmark-labels'

type LabelMap = Record<string, string>

function readMap(): LabelMap {
  const raw = getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as LabelMap
  } catch {
    return {}
  }
}

function writeMap(map: LabelMap) {
  setItem(STORAGE_KEY, JSON.stringify(map))
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
