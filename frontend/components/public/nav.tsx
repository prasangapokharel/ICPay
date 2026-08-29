"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { News01Icon } from "@hugeicons/core-free-icons"
import { APP_LOGO } from "@/lib/ui/brand-images"
import type { NavMenuItem } from "@/lib/public/site-links"
import { cn } from "@/lib/ui/utils"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { NavMenuItemContent } from "@/components/public/nav-menu-item"
import { PublicNavAuth } from "@/components/public/public-nav-auth"
import { PublicNavMobile } from "@/components/public/public-nav-mobile"
import { ThemeToggle } from "@/components/public/theme-toggle"
import { usePublicSiteLinks } from "@/hooks/i18n/use-public-site-links"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import { getNavMenuIcon } from "@/lib/public/nav-menu-icons"

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenuListItem({ item }: { item: NavMenuItem }) {
  const icon = getNavMenuIcon(item.href)
  const body = (
    <NavMenuItemContent title={item.title} description={item.description} icon={icon} />
  )

  if (item.external) {
    return (
      <li>
        <NavigationMenuLink
          className="w-full"
          render={
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {body}
            </a>
          }
        />
      </li>
    )
  }

  return (
    <li>
      <NavigationMenuLink className="w-full" render={<Link href={item.href}>{body}</Link>} />
    </li>
  )
}

function NavDropdown({
  label,
  items,
  columns = 1,
}: {
  label: string
  items: NavMenuItem[]
  columns?: 1 | 2
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul
          className={cn(
            "gap-0.5 p-1",
            columns === 1 ? "w-[22rem]" : "grid w-[32rem] grid-cols-2 lg:w-[36rem]"
          )}
        >
          {items.map((item) => (
            <NavMenuListItem key={item.href} item={item} />
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

export function PublicNav() {
  const pathname = usePathname()
  const {
    primaryLinks,
    productMenu,
    resourceMenu,
    legalMenu,
    sectionLabels,
  } = usePublicSiteLinks()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        <div className="flex min-w-0 items-center gap-5 lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={APP_LOGO}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-primary md:text-2xl">ICPay</span>
          </Link>

          <NavigationMenu className="hidden max-w-none lg:flex" align="start">
            <NavigationMenuList className="flex-wrap justify-start gap-0.5">
              {primaryLinks.map((link) => {
                const active = isActive(pathname, link.href)
                return (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "gap-2",
                        active && "bg-primary/10 text-primary hover:bg-primary/10"
                      )}
                      render={
                        <Link href={link.href} className="inline-flex items-center gap-2">
                          <HugeiconsIcon
                            icon={News01Icon}
                            className="size-4 text-primary"
                            strokeWidth={1.75}
                          />
                          {link.label}
                        </Link>
                      }
                    />
                  </NavigationMenuItem>
                )
              })}

              <NavDropdown label={sectionLabels.products} items={productMenu} />
              <NavDropdown label={sectionLabels.resources} items={resourceMenu} columns={2} />
              <NavDropdown label={sectionLabels.legal} items={legalMenu} columns={2} />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <LanguageSwitch />
          <ThemeToggle />
          <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-border/60 sm:block" />
          <PublicNavAuth />
          <PublicNavMobile />
        </div>
      </div>
    </header>
  )
}
