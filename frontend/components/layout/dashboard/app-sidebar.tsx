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
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"

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
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={APP_LOGO}
                  alt={APP_LOGO_ALT}
                  width={32}
                  height={32}
                  priority
                  className="size-8 object-cover"
                />
              </span>
              <span className="text-sm font-semibold">ICPay</span>
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
