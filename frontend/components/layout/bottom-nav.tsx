"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/ui/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"
import { AppIcon, type AppIconName } from "@/components/ui/app-icon"

type NavItem = {
  href: string
  labelKey: "home" | "icpverse" | "send" | "menu" | "buyUsername"
  icon: AppIconName
  center?: boolean
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "home", icon: "home" },
  { href: "/icpverse", labelKey: "icpverse", icon: "icpverse" },
  { href: "/username", labelKey: "buyUsername", icon: "shop", center: true },
  { href: "/transfer", labelKey: "send", icon: "send" },
  { href: "/settings", labelKey: "menu", icon: "menu" },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { identity } = useAuth()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const warmRoute = (href: string) => prefetchAppRoute(href, identity)

  return (
    <nav className="sticky bottom-0 z-50 mt-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div
        className={cn(
          "grid h-[4.25rem] grid-cols-5 items-stretch rounded-3xl px-1",
          "border border-border/60 bg-background/95 shadow-lg backdrop-blur-xl"
        )}
      >
        {navItems.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            active={isActive(item.href)}
            icon={item.icon}
            center={item.center}
            onWarm={() => warmRoute(item.href)}
          />
        ))}
      </div>
    </nav>
  )
}

function NavTab({
  href,
  label,
  icon,
  active,
  center,
  onWarm,
}: {
  href: string
  label: string
  icon: AppIconName
  active: boolean
  center?: boolean
  onWarm: () => void
}) {
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onWarm}
      onFocus={onWarm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-col items-center justify-center gap-1 transition-transform active:scale-95",
        center ? "pb-0.5" : "pb-1.5 pt-1"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          center ? "size-11" : "size-9",
          center
            ? cn("bg-muted/50", active && "bg-muted")
            : cn("bg-gray-800", active && "bg-gray-700 dark:bg-foreground/15")
        )}
      >
        <AppIcon name={icon} size={center ? 24 : 20} />
      </span>
      {!center && (
        <span
          className={cn(
            "max-w-full truncate px-0.5 text-[10px] leading-tight",
            active ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
    </Link>
  )
}
