"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Home01Icon, UserMultipleIcon, ArrowUpRight01Icon, Menu01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const LIVE_CENTER_ICON = "/images/navballcenter/2.png"

type NavItem = {
  href: string
  labelKey: "home" | "icpverse" | "send" | "menu" | "live"
  icon?: IconSvgElement
  center?: boolean
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home01Icon },
  { href: "/icpverse", labelKey: "icpverse", icon: UserMultipleIcon },
  { href: "/live", labelKey: "live", center: true },
  { href: "/transfer", labelKey: "send", icon: ArrowUpRight01Icon },
  { href: "/settings", labelKey: "menu", icon: Menu01Icon },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav className="sticky bottom-0 z-50 mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
      <div className="liquid-glass-strong grid h-16 grid-cols-5 items-center rounded-3xl px-2 shadow-lg">
        {navItems.map((item) =>
          item.center ? (
            <LiveCenterNavTab
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              active={isActive(item.href)}
            />
          ) : (
            <NavTab
              key={item.href}
              href={item.href}
              label={t(item.labelKey)}
              active={isActive(item.href)}
              icon={item.icon!}
            />
          )
        )}
      </div>
    </nav>
  )
}

function LiveCenterNavTab({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full items-center justify-center transition-colors active:scale-95",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div
        className={cn(
          "size-10 overflow-hidden rounded-full bg-primary shadow-md ring-2 ring-background",
          active && "ring-primary/40"
        )}
      >
        <Image
          src={LIVE_CENTER_ICON}
          alt=""
          width={40}
          height={40}
          priority
          className="size-full object-contain"
        />
      </div>
      <span
        className={cn(
          "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0"
        )}
      />
    </Link>
  )
}

function NavTab({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: IconSvgElement
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors active:scale-95",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="size-5" strokeWidth={1.75} />
      <span className="max-w-full truncate px-0.5">{label}</span>
      <span
        className={cn(
          "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0"
        )}
      />
    </Link>
  )
}
