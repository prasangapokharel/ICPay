import type { IconSvgElement } from "@hugeicons/react"
import {
  Analytics01Icon,
  Clock01Icon,
  CloudIcon,
  Globe02Icon,
  Home01Icon,
  JusticeScale01Icon,
  Message01Icon,
  Rocket01Icon,
  ShoppingBag01Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { APP_NAV_ITEMS, isAppNavActive } from "@/lib/navigation/app-nav-items"

export type SidebarNavItem = {
  href: string
  labelKey: string
  icon: IconSvgElement
  badgeKey?: string
  badgeType?: "gradient" | "text"
}

export type SidebarNavSection = {
  sectionKey: "overview" | "assets" | "community" | "services" | "activity"
  items: SidebarNavItem[]
}

export const SIDEBAR_FOOTER: SidebarNavItem[] = [
  {
    href: "/icpay/presale",
    labelKey: "settings.items.icpayToken",
    icon: ShoppingBag01Icon,
    badgeKey: "buyIcpay.liveBadge",
    badgeType: "gradient",
  },
]

export const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    sectionKey: "overview",
    items: [{ href: "/home", labelKey: "nav.home", icon: Home01Icon }],
  },
  {
    sectionKey: "assets",
    items: [
      { href: "/wallet", labelKey: "settings.items.tokens", icon: Wallet01Icon },
      { href: "/launch", labelKey: "settings.items.launch", icon: Rocket01Icon },
    ],
  },
  {
    sectionKey: "community",
    items: [
      { href: "/icpverse", labelKey: "nav.verse", icon: Globe02Icon },
      {
        href: "/channels",
        labelKey: "settings.items.community",
        icon: Message01Icon,
        badgeKey: "settings.items.communityBadge",
        badgeType: "gradient",
      },
    ],
  },
  {
    sectionKey: "services",
    items: [
      { href: "/bucket", labelKey: "settings.items.bucket", icon: CloudIcon, badgeKey: "settings.items.bucketBadge", badgeType: "gradient" },
      {
        href: "/username",
        labelKey: "settings.items.buyName",
        icon: UserIcon,
        badgeKey: "settings.items.buyNameBadge",
        badgeType: "gradient",
      },
    ],
  },
  {
    sectionKey: "activity",
    items: [
      { href: "/analytics", labelKey: "settings.items.analytics", icon: Analytics01Icon },
      { href: "/governance", labelKey: "settings.items.governance", icon: JusticeScale01Icon },
      { href: "/transactions", labelKey: "settings.items.history", icon: Clock01Icon },
    ],
  },
]

const ALL_ITEMS: SidebarNavItem[] = [
  ...SIDEBAR_FOOTER,
  ...SIDEBAR_SECTIONS.flatMap((section) => section.items),
]

export function isSidebarItemActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function resolveAppPageTitle(
  pathname: string,
  translate: (key: string) => string,
): string {
  const bottom = APP_NAV_ITEMS.find((item) => isAppNavActive(pathname, item.href))
  if (bottom) {
    if (bottom.labelKey === "icpverse") return translate("nav.verse")
    return translate(`nav.${bottom.labelKey}`)
  }

  const sidebar = ALL_ITEMS.find((item) => isSidebarItemActive(pathname, item.href))
  if (sidebar) return translate(sidebar.labelKey)

  if (pathname.startsWith("/channels")) return translate("settings.items.community")
  if (pathname.startsWith("/live")) return translate("settings.items.live")
  if (pathname.startsWith("/profile")) return translate("settings.items.profile")
  if (pathname.startsWith("/transfer")) return translate("common.send")
  if (pathname.startsWith("/deposit")) return translate("common.receive")
  if (pathname.startsWith("/trade") || pathname.startsWith("/swap")) {
    return translate("common.swap")
  }
  if (pathname.startsWith("/withdraw")) return translate("transactions.type.transfer")
  if (pathname.startsWith("/token/")) return translate("settings.items.tokens")
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return translate("settings.items.blog")
  }
  if (pathname.startsWith("/settings")) return translate("settings.items.settings")

  return "ICPay"
}
