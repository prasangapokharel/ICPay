export type LiveSessionSnapshot = {
  roomId: string
  tabId: string
  principal: string
  micOn: boolean
}

const KEY = "icpay:live-session"

export function readLiveSession(): LiveSessionSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as LiveSessionSnapshot
    if (!data.roomId || !data.tabId || !data.principal) return null
    return data
  } catch {
    return null
  }
}

export function writeLiveSession(snapshot: LiveSessionSnapshot): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(snapshot))
}

export function clearLiveSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}
