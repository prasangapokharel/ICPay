"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
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
  Settings01Icon,
  Logout01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { SettingsForm } from "@/components/settings/settings-form"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { shortPrincipal } from "@/lib/wallet-utils"
import { avatarUriFor } from "@/lib/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Service = {
  href: string
  label: string
  icon: IconSvgElement
  // Matched against the search box alongside the label, so "qr" finds Deposit.
  keywords?: string
}

const SECTIONS: { title: string; items: Service[] }[] = [
  {
    title: "Money",
    items: [
      { href: "/transfer", label: "Send", icon: ArrowUpRight01Icon, keywords: "transfer pay" },
      { href: "/deposit", label: "Deposit", icon: Download01Icon, keywords: "receive qr address" },
      { href: "/withdraw", label: "Withdraw", icon: Upload01Icon, keywords: "cash out" },
      { href: "/wallet", label: "Tokens", icon: Coins01Icon, keywords: "balance ckbtc holdings" },
    ],
  },
  {
    title: "Identity",
    items: [
      { href: "/username", label: "Buy Name", icon: ShoppingBag01Icon, keywords: "username premium handle" },
      { href: "/profile", label: "Profile", icon: UserIcon, keywords: "account principal" },
      { href: "/icpverse", label: "ICPverse", icon: UserMultipleIcon, keywords: "people tip discover" },
      { href: "/deposit", label: "My QR", icon: QrCode01Icon, keywords: "scan code address" },
    ],
  },
  {
    title: "Activity",
    items: [
      { href: "/transactions", label: "History", icon: Clock01Icon, keywords: "activity transactions" },
      { href: "/", label: "Balance", icon: Wallet01Icon, keywords: "home dashboard" },
    ],
  },
]

export default function MenuPage() {
  const { identity, logout } = useAuth()
  const [query, setQuery] = useState("")

  const principal = identity?.getPrincipal().toText() ?? ""

  // Cached like every other read: settings change only when this page writes
  // them, and the write below seeds the cache directly, so revisiting the page
  // never needs to call the canister again.
  const { data: settings, mutate } = useSWR(
    identity ? (["settings", principal] as const) : null,
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getSettings()
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    { revalidateOnFocus: false, revalidateIfStale: false, keepPreviousData: true }
  )

  const handleSave = async (theme: string, language: string, notifications: boolean): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.updateSettings(theme, language, notifications)
      if ("ok" in result) {
        // The canister returns the saved record, so the cache can be updated
        // from it without a follow-up read.
        mutate(result.ok, { revalidate: false })
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Failed to save settings"
    }
  }

  const needle = query.trim().toLowerCase()
  const sections = needle
    ? SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter((i) =>
          `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(needle)
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Menu</h1>
        <p className="text-sm text-muted-foreground">Every ICPay feature in one place</p>
      </div>

      <Link
        href="/profile"
        className="flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:bg-accent"
      >
        <Avatar className="size-11">
          {principal && <AvatarImage src={avatarUriFor(principal)} alt="" />}
          <AvatarFallback className="bg-muted text-xs font-medium">
            {principal.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Your account</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortPrincipal(principal)}
          </p>
        </div>
      </Link>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services"
          className="h-11 rounded-2xl pl-11"
        />
      </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold">{section.title}</h2>
          <div className="grid grid-cols-4 gap-y-5">
            {section.items.map((item) => (
              <ServiceTile key={`${section.title}-${item.label}`} {...item} />
            ))}
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nothing matches &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      {settings && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <HugeiconsIcon icon={Settings01Icon} className="size-4" />
            Preferences
          </h2>
          <SettingsForm settings={settings} onSave={handleSave} />
        </div>
      )}

      <button
        type="button"
        onClick={() => logout()}
        className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4.5 shrink-0" />
        <span className="flex-1">Sign out</span>
      </button>
    </div>
  )
}

function ServiceTile({ href, label, icon }: Service) {
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
