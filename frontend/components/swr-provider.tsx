"use client"

import type { ReactNode } from "react"
import { SWRConfig } from "swr"

// Shared defaults for every hook. Per-hook options override these where IC cost
// or UX needs differ (e.g. useUserSearch turns focus revalidation back on).
const swrDefaults = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 3,
  dedupingInterval: 2_000,
} as const

export function SwrProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={swrDefaults}>{children}</SWRConfig>
}
