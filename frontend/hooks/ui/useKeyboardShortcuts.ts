"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Only allow shortcuts for authenticated users
      if (!isAuthenticated) return

      // Cmd/Ctrl + K for search (common pattern)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
        return
      }

      // Single key shortcuts (only when not in an input)
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      switch (e.key) {
        case "/":
          e.preventDefault()
          // Focus search input
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
          break
        case "s":
          e.preventDefault()
          router.push("/transfer")
          break
        case "r":
          e.preventDefault()
          router.push("/deposit")
          break
        case "t":
          e.preventDefault()
          router.push("/market/trade")
          break
        case "h":
          e.preventDefault()
          router.push("/home")
          break
        case "w":
          e.preventDefault()
          router.push("/wallet")
          break
        case "Escape":
          // Clear focused search input
          const focusedInput = document.activeElement as HTMLInputElement
          if (focusedInput && focusedInput.tagName === "INPUT") {
            focusedInput.blur()
            if (focusedInput.type === "search") {
              focusedInput.value = ""
              focusedInput.dispatchEvent(new Event("input", { bubbles: true }))
            }
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router, isAuthenticated])
}
