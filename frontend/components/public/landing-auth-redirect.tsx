"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export function LandingAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname
      if (path !== "/" && path !== "/index.html") {
        return
      }
    }

    if (!isLoading && isAuthenticated) {
      router.replace("/home")
    }
  }, [isLoading, isAuthenticated, router])

  return null
}
