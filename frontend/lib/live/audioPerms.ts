const PLAYBACK_KEY = "icpay:live-playback-unlocked"

export function markPlaybackUnlocked(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PLAYBACK_KEY, "1")
}

export function wasPlaybackUnlocked(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(PLAYBACK_KEY) === "1"
}

export async function micPermissionGranted(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return false
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName })
    return status.state === "granted"
  } catch {
    return false
  }
}
