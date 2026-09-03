"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HeaderUserMenu } from "@/components/layout/dashboard/header-user-menu"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { resolveAppPageTitle } from "@/lib/navigation/app-sidebar-nav"

export function AppSiteHeader() {
  const pathname = usePathname()
  const t = useTranslations()
  const title = resolveAppPageTitle(pathname, (key) => t(key as never))

  return (
    <header className="hidden h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm md:flex">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-4 data-vertical:self-auto" />
        <h1 className="flex-1 truncate text-sm font-normal">{title}</h1>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          render={<Link href="/market/trade" />}
        >
          <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-4" strokeWidth={2} />
          Trade
        </Button>
        <div className="flex shrink-0 items-center rounded-full border border-border/70 bg-muted/40 p-0.5">
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-0.5 h-5 data-vertical:self-auto" />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  )
}
