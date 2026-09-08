const HIDE_ZERO_KEY = "icpay-wallet-hide-zero"
export const HIDE_ZERO_EVENT = "icpay-wallet-hide-zero-change"

export function readHideZeroBalances(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(HIDE_ZERO_KEY) !== "false"
}

export function writeHideZeroBalances(hide: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(HIDE_ZERO_KEY, hide ? "true" : "false")
  window.dispatchEvent(new CustomEvent(HIDE_ZERO_EVENT, { detail: { hide } }))
}
