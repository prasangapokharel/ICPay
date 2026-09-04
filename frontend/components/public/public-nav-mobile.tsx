"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import type { NavMenuItem } from "@/lib/public/site-links"
import { cn } from "@/lib/ui/utils"
import { NavMenuLinkRow } from "@/components/public/nav-menu-item"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

function MobileNavSection({
  title,
  items,
  onNavigate,
}: {
  title: string
  items: NavMenuItem[]
  onNavigate: () => void
}) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavMenuLinkRow item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PublicNavMobile() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const {
    primaryLinks,
    productMenu,
    resourceMenu,
    legalMenu,
    sectionLabels,
    navLabels,
  } = usePublicSiteLinks()

  const close = () => setOpen(false)

  return (
    <>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="rounded-full text-muted-foreground hover:text-foreground lg:hidden"
        aria-label={navLabels.openMenu}
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="size-4" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right" showSwipeHandle>
        <DrawerContent className="max-h-[min(100dvh-1rem,100%)] data-[swipe-direction=right]:w-[min(100vw-1rem,20rem)]">
          <DrawerHeader className="border-b border-border/60 pb-4">
            <DrawerTitle>{navLabels.menu}</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-6 overflow-y-auto px-2 py-4">
            <div className="space-y-1">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <MobileNavSection title={sectionLabels.products} items={productMenu} onNavigate={close} />
            <MobileNavSection title={sectionLabels.resources} items={resourceMenu} onNavigate={close} />
            <MobileNavSection title={sectionLabels.more} items={legalMenu} onNavigate={close} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
