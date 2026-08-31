"use client"

import { useSyncExternalStore } from "react"

/** Wide enough for 3-column resizable terminal (markets | chart | order). */
const TRADE_DESKTOP_BREAKPOINT = 1100

function subscribeWide(onStoreChange: () => void) {
  const mql = window.matchMedia(`(min-width: ${TRADE_DESKTOP_BREAKPOINT}px)`)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useIsTradeDesktop() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(`(min-width: ${TRADE_DESKTOP_BREAKPOINT}px)`).matches,
    () => true
  )
}
