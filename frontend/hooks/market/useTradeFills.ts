"use client"

import { useSyncExternalStore } from "react"
import {
  clearTradeFillNotice,
  getTradeFillNotice,
  getTradeFills,
  subscribeTradeFills,
} from "@/lib/market/tradeFillStore"

export function useTradeFills() {
  return useSyncExternalStore(subscribeTradeFills, getTradeFills, getTradeFills)
}

export function useTradeFillNotice() {
  const notice = useSyncExternalStore(
    subscribeTradeFills,
    getTradeFillNotice,
    getTradeFillNotice
  )
  return { notice, clear: clearTradeFillNotice }
}
