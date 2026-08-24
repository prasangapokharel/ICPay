"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommunityExplorer } from "@/components/community/community-explorer"
import { CommunityNavRail } from "@/components/community/community-nav-rail"
import { useIsDesktop } from "@/hooks/ui/useMobile"

export function CommunityWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const onList = pathname === "/channels"

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {isDesktop ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0 w-full flex-1">
          <ResizablePanel
            id="community-rail"
            defaultSize={72}
            minSize={64}
            maxSize={88}
            groupResizeBehavior="preserve-pixel-size"
            className="h-full"
          >
            <CommunityNavRail />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            id="community-explorer"
            defaultSize="28%"
            minSize="20%"
            maxSize="38%"
            collapsible
            className="h-full overflow-hidden"
          >
            <CommunityExplorer />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="community-feed" defaultSize="68%" minSize="40%" className="h-full min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : onList ? (
        <div className="flex h-full min-h-0 flex-col">
          <CommunityExplorer />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      )}
      </div>
    </TooltipProvider>
  )
}
