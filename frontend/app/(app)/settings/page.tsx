"use client"

import { useState } from "react"
import Link from "next/link"
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
  Logout01Icon,
  Search01Icon,
  ShieldKeyIcon,
  File01Icon,
  LockKeyIcon,
  InformationCircleIcon,
  HelpCircleIcon,
  MapsLocation01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { LanguageSelect } from "@/components/i18n/language-select"
import { FiatSelector } from "@/components/fiat/fiat-selector"
import { cn } from "@/lib/utils"
import type en from "@/language/en/common.json"

// Derived from the catalog rather than declared as string: adding an entry
// below without translating it is then a compile error, not a raw key in the UI.
type ItemKey = keyof typeof en.settings.items
type SectionKey = keyof typeof en.settings.sections

type Service = {
  href: string
  key: ItemKey
  icon: IconSvgElement
  // Matched against the search box alongside the label, so "qr" finds Deposit.
  keywords?: string
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

// Kept out of SECTIONS so the service search does not filter them away: these
// are the pages someone goes looking for deliberately, not features to browse.
const LEGAL: { href: string; key: ItemKey; icon: IconSvgElement }[] = [
  { href: "/about", key: "about", icon: InformationCircleIcon },
  { href: "/faq", key: "faq", icon: HelpCircleIcon },
  { href: "/roadmap", key: "roadmap", icon: MapsLocation01Icon },
  { href: "/transparency", key: "transparency", icon: ShieldKeyIcon },
  { href: "/terms", key: "terms", icon: File01Icon },
  { href: "/privacy", key: "privacy", icon: LockKeyIcon },
]

export default function MenuPage() {
  const { logout } = useAuth()
  const [query, setQuery] = useState("")
  const t = useTranslations("settings")

  const needle = query.trim().toLowerCase()
  const sections = needle
    ? SECTIONS.map((s) => ({
        ...s,
        // Searched against the translated label as well as the English
        // keywords, so the box works in the active language and still
        // answers the latin aliases a bilingual user might type.
        items: s.items.filter((i) =>
          `${t(`items.${i.key}`)} ${i.keywords ?? ""}`.toLowerCase().includes(needle)
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 rounded-2xl pl-11"
        />
      </div>

      {sections.map((section) => (
        <div key={section.key} className="space-y-3">
          <h2 className="text-sm font-semibold">{t(`sections.${section.key}`)}</h2>
          <div className="grid grid-cols-4 gap-y-5">
            {section.items.map((item) => (
              <ServiceTile
                key={`${section.key}-${item.key}`}
                href={item.href}
                icon={item.icon}
                label={t(`items.${item.key}`)}
              />
            ))}
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("noMatch")} &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">{t("sections.preferences")}</h2>
        <LanguageSelect />
        <FiatSelector />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">{t("sections.legal")}</h2>
        <div className="overflow-hidden rounded-2xl border">
          {LEGAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 border-b px-4 py-3.5 text-sm transition-colors last:border-0 hover:bg-accent"
            >
              <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0 text-muted-foreground" />
              <span className="flex-1">{t(`items.${item.key}`)}</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 shrink-0 text-muted-foreground"
              />
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => logout()}
        className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4.5 shrink-0" />
        <span className="flex-1">{t("signOut")}</span>
      </button>
    </div>
  )
}

function ServiceTile({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: IconSvgElement
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 text-center transition-transform active:scale-95"
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl bg-muted/60",
          "transition-colors hover:bg-accent"
        )}
      >
        <HugeiconsIcon icon={icon} className="size-6 text-primary" strokeWidth={1.75} />
      </span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </Link>
  )
}
