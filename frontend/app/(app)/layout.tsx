"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { Spinner } from "@/components/ui/spinner"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="h-svh bg-muted/40">
      {/* Phone-width column: mobile-first, so it stays narrow and centered
          rather than stretching across desktop viewports. */}
      <div className="relative mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden bg-background shadow-sm">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
