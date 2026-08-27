"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav, bottomNavSpacerClass } from "@/components/layout/bottom-nav"
import { LiveSessionProvider } from "@/components/live/live-session-provider"
import { cn } from "@/lib/ui/utils"

function isChannelsRoute(pathname: string): boolean {
  return pathname === "/channels" || pathname.startsWith("/channels/")
}

function isChannelChatRoute(pathname: string): boolean {
  if (!pathname.startsWith("/channels/")) return false
  return pathname !== "/channels/new"
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const channels = isChannelsRoute(pathname)
  const channelChat = isChannelChatRoute(pathname)

  return (
    <LiveSessionProvider>
      <div className="min-h-svh bg-muted/40">
        <div
          className={cn(
            "relative mx-auto flex w-full flex-col bg-background shadow-sm",
            channels ? "h-svh max-w-md md:max-w-6xl" : "min-h-svh max-w-md"
          )}
        >
          {!channelChat && (
            <div className={cn(channels && "md:hidden")}>
              <AppHeader />
            </div>
          )}
          <main
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              channels
                ? cn(
                    "h-full overflow-hidden px-0 pt-0",
                    channelChat ? "pb-0" : cn(bottomNavSpacerClass, "md:pb-0")
                  )
                : cn("px-4 pt-2", bottomNavSpacerClass)
            )}
          >
            {children}
          </main>
          <div className={cn(channels && "md:hidden", channelChat && "max-md:hidden")}>
            <BottomNav />
          </div>
        </div>
      </div>
    </LiveSessionProvider>
  )
}
