"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  Download01Icon,
  Upload01Icon,
  ShoppingBag01Icon,
  Wallet01Icon,
  Clock01Icon,
  UserMultipleIcon,
  UserIcon,
  QrCode01Icon,
  Coins01Icon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { ServiceTile } from "@/components/settings/service-tile"
import { SettingsDrawer } from "@/components/settings/settings-drawer"
import type en from "@/language/en/common.json"

// Derived from the catalog rather than declared as string: adding an entry
// below without translating it is then a compile error, not a raw key in the UI.
type ItemKey = keyof typeof en.settings.items
type SectionKey = keyof typeof en.settings.sections

type Service = {
  href?: string
  key: ItemKey
  icon: IconSvgElement
  // Matched against the search box alongside the label, so "qr" finds Deposit.
  keywords?: string
  // Tiles without a route render as buttons; the settings one opens the drawer.
  onOpen?: () => void
}

const SECTIONS: { key: SectionKey; items: Service[] }[] = [
  {
    key: "money",
    items: [
      { href: "/transfer", key: "send", icon: ArrowUpRight01Icon, keywords: "transfer pay" },
      { href: "/deposit", key: "deposit", icon: Download01Icon, keywords: "receive qr address" },
      { href: "/withdraw", key: "withdraw", icon: Upload01Icon, keywords: "cash out" },
      { href: "/wallet", key: "tokens", icon: Coins01Icon, keywords: "balance ckbtc holdings" },
    ],
  },
  {
    key: "identity",
    items: [
      { href: "/username", key: "buyName", icon: ShoppingBag01Icon, keywords: "username premium handle" },
      { href: "/profile", key: "profile", icon: UserIcon, keywords: "account principal" },
      { href: "/icpverse", key: "icpverse", icon: UserMultipleIcon, keywords: "people tip discover" },
      { href: "/deposit", key: "myQr", icon: QrCode01Icon, keywords: "scan code address" },
    ],
  },
  {
    key: "activity",
    items: [
      { href: "/transactions", key: "history", icon: Clock01Icon, keywords: "activity transactions" },
      { href: "/", key: "balance", icon: Wallet01Icon, keywords: "home dashboard" },
    ],
  },
]

export default function MenuPage() {
  const [query, setQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations("settings")

  const settingsTile: Service = {
    key: "settings",
    icon: Settings01Icon,
    keywords: "preferences language legal about",
    onOpen: () => setDrawerOpen(true),
  }

  const sections = SECTIONS.map((s) => ({
    ...s,
    items:
      s.key === "activity"
        ? [...s.items, settingsTile]
        : s.items,
  }))

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? sections
        .map((s) => ({
          ...s,
          // Searched against the translated label as well as the English
          // keywords, so the box works in the active language and still
          // answers the latin aliases a bilingual user might type.
          items: s.items.filter((i) =>
            `${t(`items.${i.key}`)} ${i.keywords ?? ""}`.toLowerCase().includes(needle)
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-9 rounded-full pl-9 text-sm"
        />
      </div>

      {visible.map((section) => (
        <div key={section.key} className="space-y-3">
          <h2 className="text-sm font-semibold">{t(`sections.${section.key}`)}</h2>
          <div className="grid grid-cols-4 gap-y-5">
            {section.items.map((item) => (
              <ServiceTile
                key={`${section.key}-${item.key}`}
                href={item.href}
                icon={item.icon}
                label={t(`items.${item.key}`)}
                onClick={item.onOpen}
              />
            ))}
          </div>
        </div>
      ))}

      {visible.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("noMatch")} &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      <SettingsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
