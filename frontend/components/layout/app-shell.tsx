"use client"

import type { ReactNode } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { LiveSessionProvider } from "@/components/live/live-session-provider"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LiveSessionProvider>
      <div className="min-h-svh bg-muted/40">
        <div className="relative mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm">
          <AppHeader />
          <main className="flex-1 px-4 pb-28 pt-2">{children}</main>
          <BottomNav />
        </div>
      </div>
    </LiveSessionProvider>
  )
}
