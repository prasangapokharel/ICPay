"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav, bottomNavSpacerClass } from "@/components/layout/bottom-nav"
import { AppDashboardShell } from "@/components/layout/dashboard/app-dashboard-shell"
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
      <AppDashboardShell>
        <div className={cn("md:hidden", channelChat && "hidden")}>
          <AppHeader />
        </div>
        <main
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col max-w-md md:max-w-none",
            channels
              ? channelChat
                ? "h-full overflow-hidden p-0"
                : cn("px-0 pt-0", bottomNavSpacerClass, "md:pb-0")
              : cn("px-4 pt-2", bottomNavSpacerClass, "md:px-6 md:py-6 md:pb-6"),
          )}
        >
          {children}
        </main>
        <div className={cn("md:hidden", channelChat && "hidden")}>
          <BottomNav />
        </div>
      </AppDashboardShell>
    </LiveSessionProvider>
  )
}
