"use client"

import Link from "next/link"
import Image from "next/image"
import type { ComponentProps } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DashboardNavFooter, DashboardNavMain } from "@/components/layout/dashboard/nav-main"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { APP_LOGO_ALT, SIDEBAR_HEADER_LOGO } from "@/lib/ui/brand-images"

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/home" />}
            >
              <div className="flex h-8 items-center px-1">
                <Image
                  src={SIDEBAR_HEADER_LOGO}
                  alt={APP_LOGO_ALT}
                  width={140}
                  height={30}
                  priority
                  className="h-7 w-auto object-contain"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-1">
        <DashboardNavMain />
      </SidebarContent>
      <SidebarFooter className="gap-1 border-t border-sidebar-border/60 p-2">
        <DashboardNavFooter />
        <LanguageSwitch variant="row" />
        <p className="px-2.5 pt-1 text-[11px] text-muted-foreground">ICPay</p>
      </SidebarFooter>
    </Sidebar>
  )
}
