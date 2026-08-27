const GUIDE_KEY = "icpay:presale-guide"

export function hasSeenPresaleGuide(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(GUIDE_KEY) === "1"
}

export function markPresaleGuideSeen(): void {
  localStorage.setItem(GUIDE_KEY, "1")
}
