"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { ServiceTile } from "@/components/settings/service-tile"
import { SettingsDrawer } from "@/components/settings/settings-drawer"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute, prefetchGovernance } from "@/lib/navigation/prefetchRoute"
import type { AppIconName } from "@/components/ui/app-icon"
import type en from "@/language/en/common.json"

type ItemKey = keyof typeof en.settings.items
type SectionKey = keyof typeof en.settings.sections

type Service = {
  href?: string
  key: ItemKey
  icon: AppIconName
  keywords?: string
  onOpen?: () => void
  badge?: ItemKey
}

export default function MenuPage() {
  const [query, setQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations("settings")
  const { identity } = useAuth()

  const sections: { key: SectionKey; items: Service[] }[] = [
    {
      key: "money",
      items: [
        {
          href: "/transfer",
          key: "send",
          icon: "send",
          keywords: "send transfer pay username principal",
        },
        {
          href: "/deposit",
          key: "deposit",
          icon: "deposit",
          keywords: "receive deposit address qr icp",
        },
        {
          href: "/withdraw",
          key: "withdraw",
          icon: "withdraw",
          keywords: "transfer trading wallet internal",
        },
        {
          href: "/wallet",
          key: "tokens",
          icon: "wallet",
          keywords: "balance ckbtc holdings",
        },
        {
          href: "/trade",
          key: "swap",
          icon: "swap",
          keywords: "exchange trade icpswap convert",
        },
        {
          href: "/launch",
          key: "launch",
          icon: "launch",
          keywords: "create token icrc mint deploy",
        },
      ],
    },
    {
      key: "storage",
      items: [
        {
          href: "/bucket",
          key: "bucket",
          icon: "bucket",
          keywords: "bucket storage upload files cdn cloud",
        },
      ],
    },
    {
      key: "identity",
      items: [
        {
          href: "/username",
          key: "buyName",
          icon: "username",
          keywords: "username premium handle",
          badge: "buyNameBadge",
        },
        {
          href: "/icpverse",
          key: "icpverse",
          icon: "icpverse",
          keywords: "people tip discover",
        },
        {
          href: "/channels",
          key: "community",
          icon: "community",
          keywords: "channels community telegram broadcast",
          badge: "communityBadge",
        },
      ],
    },
    {
      key: "activity",
      items: [
        {
          href: "/analytics",
          key: "analytics",
          icon: "analytics",
          keywords: "analytics stats export csv premium",
        },
        {
          href: "/governance",
          key: "governance",
          icon: "governance",
          keywords: "nns sns vote proposals neuron",
        },
        {
          href: "/transactions",
          key: "history",
          icon: "history",
          keywords: "activity transactions",
        },
      ],
    },
    {
      key: "more",
      items: [
        {
          href: "/blog",
          key: "blog",
          icon: "blog",
          keywords: "blog articles guides packages sdk",
        },
        {
          key: "settings",
          icon: "settings",
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
    <AppPage title={t("title")} description={t("subtitle")}>
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
          <div className="grid grid-cols-3 gap-y-6">
            {section.items.map((item) => (
              <ServiceTile
                key={`${section.key}-${item.key}`}
                href={item.href}
                icon={item.icon}
                label={t(`items.${item.key}`)}
                onClick={item.onOpen}
                badge={item.badge ? t(`items.${item.badge}`) : undefined}
                onPrefetch={
                  item.href
                    ? item.href === "/governance"
                      ? () => prefetchGovernance(identity)
                      : () => prefetchAppRoute(item.href!, identity)
                    : undefined
                }
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
    </AppPage>
  )
}
