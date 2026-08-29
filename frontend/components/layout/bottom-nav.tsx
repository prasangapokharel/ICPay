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
  labelKey: "home" | "icpverse" | "history" | "menu" | "presale"
  icon: AppIconName
  center?: boolean
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "home", icon: "home" },
  { href: "/icpverse", labelKey: "icpverse", icon: "icpverse" },
  { href: "/icpay/presale", labelKey: "presale", icon: "icpay", center: true },
  { href: "/transactions", labelKey: "history", icon: "history" },
  { href: "/settings", labelKey: "menu", icon: "menu" },
]

export const bottomNavSpacerClass =
  "pb-[calc(5.5rem+max(0.75rem,env(safe-area-inset-bottom))+0.75rem)]"

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { identity } = useAuth()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const warmRoute = (href: string) => prefetchAppRoute(href, identity)

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md",
        "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      )}
    >
      <div
        className={cn(
          "grid min-h-[4.5rem] grid-cols-5 items-stretch rounded-3xl px-0.5 py-1",
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
  const filled = center && icon === "icpay"

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onWarm}
      onFocus={onWarm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex min-w-0 flex-col items-center justify-end gap-0.5 px-0.5 pb-0.5 pt-1 transition-transform active:scale-95"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 overflow-hidden rounded-full",
          !filled && "items-center justify-center",
          filled
            ? cn("ring-1 ring-border/60", active && "ring-primary/40")
            : cn(
                "bg-gray-800",
                center && "bg-muted/60 ring-1 ring-border/60",
                active &&
                  (center ? "bg-muted ring-primary/40" : "bg-gray-700 dark:bg-foreground/15")
              )
        )}
      >
        <AppIcon
          name={icon}
          size={filled ? 36 : center ? 22 : 20}
          priority={filled}
          className={filled ? "size-full object-cover" : undefined}
        />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[11px] leading-none",
          active ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  )
}
