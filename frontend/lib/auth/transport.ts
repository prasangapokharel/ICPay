import { REDIRECT_PENDING_KEY } from "@/lib/auth/config"

export function prefersRedirectTransport(): boolean {
  // ICRC-167 redirect breaks on iOS Safari ("Unable to connect" on id.ai).
  // Popup transport works on mobile when signIn starts inside the click handler.
  return false
}

export function markRedirectPending(): void {
  sessionStorage.setItem(REDIRECT_PENDING_KEY, "1")
}

export function clearRedirectPending(): void {
  sessionStorage.removeItem(REDIRECT_PENDING_KEY)
}

export function hasRedirectPending(): boolean {
  return sessionStorage.getItem(REDIRECT_PENDING_KEY) === "1"
}

export function isInternetIdentityReturn(): boolean {
  if (typeof window === "undefined") return false
  const hash = window.location.hash.slice(1)
  if (!hash) return false
  return new URLSearchParams(hash).has("message")
}

export function clearInternetIdentityReturnHash(): void {
  if (typeof window === "undefined" || !window.location.hash) return
  window.history.replaceState(null, "", window.location.pathname + window.location.search)
}
