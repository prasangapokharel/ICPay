"use client"

import { useState } from "react"
import Link from "next/link"
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

// Kept out of SECTIONS so the service search does not filter them away: these
// are the pages someone goes looking for deliberately, not features to browse.
const LEGAL: { href: string; label: string; icon: IconSvgElement }[] = [
  { href: "/about", label: "About ICPay", icon: InformationCircleIcon },
  { href: "/faq", label: "FAQ", icon: HelpCircleIcon },
  { href: "/roadmap", label: "Roadmap", icon: MapsLocation01Icon },
  { href: "/transparency", label: "Security & Transparency", icon: ShieldKeyIcon },
  { href: "/terms", label: "Terms of Service", icon: File01Icon },
  { href: "/privacy", label: "Privacy Policy", icon: LockKeyIcon },
]

export default function MenuPage() {
  const { logout } = useAuth()
  const [query, setQuery] = useState("")

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

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Legal</h2>
        <div className="overflow-hidden rounded-2xl border">
          {LEGAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 border-b px-4 py-3.5 text-sm transition-colors last:border-0 hover:bg-accent"
            >
              <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
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
