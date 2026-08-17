"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ShoppingBag01Icon,
  UserMultipleIcon,
  Coins01Icon,
  RocketIcon,
  Search01Icon,
  Settings01Icon,
  BookOpen01Icon,
  BucketIcon,
  ArrowDataTransferVerticalIcon,
  RadioIcon,
  ChartLineData01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { ServiceTile } from "@/components/settings/service-tile"
import { SettingsDrawer } from "@/components/settings/settings-drawer"
import type en from "@/language/en/common.json"

type ItemKey = keyof typeof en.settings.items
type SectionKey = keyof typeof en.settings.sections

type Service = {
  href?: string
  key: ItemKey
  icon: IconSvgElement
  keywords?: string
  onOpen?: () => void
  badge?: ItemKey
}

export default function MenuPage() {
  const [query, setQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations("settings")

  const sections: { key: SectionKey; items: Service[] }[] = [
    {
      key: "money",
      items: [
        {
          href: "/wallet",
          key: "tokens",
          icon: Coins01Icon,
          keywords: "balance ckbtc holdings",
        },
        {
          href: "/swap",
          key: "swap",
          icon: ArrowDataTransferVerticalIcon,
          keywords: "exchange trade icpswap convert",
        },
        {
          href: "/launch",
          key: "launch",
          icon: RocketIcon,
          keywords: "create token icrc mint deploy",
        },
      ],
    },
    {
      key: "identity",
      items: [
        {
          href: "/username",
          key: "buyName",
          icon: ShoppingBag01Icon,
          keywords: "username premium handle",
          badge: "buyNameBadge",
        },
        {
          href: "/icpverse",
          key: "icpverse",
          icon: UserMultipleIcon,
          keywords: "people tip discover",
        },
        {
          href: "/live",
          key: "live",
          icon: RadioIcon,
          keywords: "audio voice room webrtc",
        },
      ],
    },
    {
      key: "activity",
      items: [
        {
          href: "/analytics",
          key: "analytics",
          icon: ChartLineData01Icon,
          keywords: "analytics stats export csv premium",
        },
        {
          href: "/transactions",
          key: "history",
          icon: Clock01Icon,
          keywords: "activity transactions",
        },
      ],
    },
    {
      key: "storage",
      items: [
        {
          href: "/bucket",
          key: "bucket",
          icon: BucketIcon,
          keywords: "storage cloud images bucket cdn upload",
        },
      ],
    },
    {
      key: "more",
      items: [
        {
          href: "/blog",
          key: "blog",
          icon: BookOpen01Icon,
          keywords: "blog articles guides packages sdk",
        },
        {
          key: "settings",
          icon: Settings01Icon,
          keywords: "preferences language legal about",
          onOpen: () => setDrawerOpen(true),
        },
      ],
    },
  ]

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter((i) =>
            `${t(`items.${i.key}`)} ${i.keywords ?? ""}`
              .toLowerCase()
              .includes(needle)
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
          className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          variant="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="text-sm"
        />
      </div>

      {visible.map((section) => (
        <div key={section.key} className="space-y-3">
          <h2 className="text-sm font-semibold">
            {t(`sections.${section.key}`)}
          </h2>
          <div className="grid grid-cols-4 gap-y-5">
            {section.items.map((item) => (
              <ServiceTile
                key={`${section.key}-${item.key}`}
                href={item.href}
                icon={item.icon}
                label={t(`items.${item.key}`)}
                onClick={item.onOpen}
                badge={item.badge ? t(`items.${item.badge}`) : undefined}
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
