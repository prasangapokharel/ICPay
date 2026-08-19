"use client"

import { useEffect, useState } from "react"

// Holds back the value until typing settles, so a lookup runs once per pause
// instead of once per keystroke.
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
