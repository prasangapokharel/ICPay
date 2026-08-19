"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"

function lastSegment(path: string): string {
  const segments = path.split("/").filter(Boolean)
  if (segments.length === 0) return ""
  return decodeURIComponent(segments[segments.length - 1])
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  return () => window.removeEventListener("popstate", onStoreChange)
}

function getBrowserLastSegment(): string {
  return lastSegment(window.location.pathname)
}

// Static export serves one shell per dynamic route; Vercel rewrites keep the
// visitor's URL (/icpverse/alice) but Next's router reports the shell path
// (/icpverse/profile). Read the real segment from window.location instead.
export function useRewrittenLastSegment(): string {
  const pathname = usePathname()
  void pathname

  return useSyncExternalStore(
    subscribe,
    getBrowserLastSegment,
    () => "",
  )
}
