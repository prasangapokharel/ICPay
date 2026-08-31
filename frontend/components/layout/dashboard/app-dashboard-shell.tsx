"use client"

import type { ReactNode } from "react"
import type { CSSProperties } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar"
import { AppSiteHeader } from "@/components/layout/dashboard/app-site-header"

const shellStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as CSSProperties

export function AppDashboardShell({
  children,
  showSidebar = true,
  showHeader = true,
}: {
  children: ReactNode
  showSidebar?: boolean
  showHeader?: boolean
}) {
  return (
    <TooltipProvider>
      <SidebarProvider style={shellStyle}>
        {showSidebar ? <AppSidebar variant="inset" /> : null}
        <SidebarInset>
          {showHeader ? <AppSiteHeader /> : null}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
