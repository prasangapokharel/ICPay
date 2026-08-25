"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"

export function AppAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const gated = isLoading || !isAuthenticated

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, router])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {gated && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      {/* Keep the route segment mounted for Next.js instant-nav validation. SWR
          keys stay null until identity exists, so nothing sensitive fetches. */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", gated && "invisible")}
        aria-hidden={gated}
      >
        {children}
      </div>
    </div>
  )
}
