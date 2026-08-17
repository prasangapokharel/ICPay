"use client"

import { useEffect, useState } from "react"

/** True while the tab is in the foreground — used to pause IC polling. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || !document.hidden
  )

  useEffect(() => {
    const sync = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])

  return visible
}
