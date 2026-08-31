import type { IconSvgElement } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  Clock01Icon,
  Globe02Icon,
  Home01Icon,
  Menu01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"

export type AppNavItem = {
  href: string
  labelKey: "home" | "icpverse" | "history" | "menu" | "presale"
  icon: IconSvgElement
  center?: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/home", labelKey: "home", icon: Home01Icon },
  { href: "/icpverse", labelKey: "icpverse", icon: Globe02Icon },
  { href: "/icpay/presale", labelKey: "presale", icon: ShoppingBag01Icon, center: true },
  { href: "/transactions", labelKey: "history", icon: Clock01Icon },
  { href: "/settings", labelKey: "menu", icon: Menu01Icon },
]

export const APP_QUICK_ACTION = {
  href: "/transfer",
  labelKey: "send" as const,
  icon: ArrowUp01Icon,
}

export function isAppNavActive(pathname: string, href: string): boolean {
  return href === "/home" ? pathname === "/home" : pathname.startsWith(href)
}
