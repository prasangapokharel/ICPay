import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768

function subscribeViewport(onStoreChange: () => void) {
  const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeViewport,
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
    () => false
  )
}

export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeViewport,
    () => window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`).matches,
    () => false
  )
}
