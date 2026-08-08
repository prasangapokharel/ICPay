"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Shield01Icon,
  Crown02Icon,
  ArrowUpRight01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"

// All brand names reserved on mainnet by the controller. These handles are
// blocked so nobody can impersonate a real brand. The source of truth lives in
// the backend (`listReservedUsernames`), kept mirrored here for display.
const RESERVED_BRANDS = [
  "adele",
  "adidas",
  "adobe",
  "adyen",
  "algorand",
  "amazon",
  "amex",
  "amm",
  "apple",
  "aptos",
  "arbitrum",
  "audi",
  "bank",
  "base",
  "bentley",
  "beyonce",
  "bezos",
  "binance",
  "bmw",
  "btc",
  "bugatti",
  "burger",
  "caiman",
  "cartier",
  "casio",
  "chanel",
  "cisco",
  "coca",
  "coin",
  "coinbase",
  "cycles",
  "dell",
  "dex",
  "dext",
  "dior",
  "discord",
  "disney",
  "dodge",
  "dominic",
  "domino",
  "drake",
  "eminem",
  "eth",
  "ferrari",
  "fifa",
  "ford",
  "gates",
  "gillette",
  "google",
  "gucci",
  "haaland",
  "hamilton",
  "hermes",
  "honda",
  "hulu",
  "hyundai",
  "ibm",
  "ic",
  "icppay",
  "icpverse",
  "icrc",
  "ikea",
  "intel",
  "jeep",
  "jobs",
  "josh",
  "kanye",
  "kfc",
  "kia",
  "kraken",
  "lambo",
  "ledger",
  "lenovo",
  "maradona",
  "mazda",
  "mbappe",
  "mercedes",
  "messi",
  "metamask",
  "mlb",
  "musk",
  "nba",
  "netflix",
  "neurons",
  "neymar",
  "nfl",
  "nft",
  "nhl",
  "nike",
  "nissan",
  "nns",
  "nokia",
  "nvidia",
  "obama",
  "omega",
  "opensea",
  "oracle",
  "pay",
  "paypal",
  "peacock",
  "pele",
  "pepsi",
  "phantom",
  "pierre",
  "plaid",
  "polygon",
  "porsche",
  "prada",
  "puma",
  "putin",
  "reddit",
  "reebok",
  "revolut",
  "rihanna",
  "rivian",
  "rolex",
  "ronaldo",
  "samsung",
  "seiko",
  "shakira",
  "snap",
  "sns",
  "sol",
  "sony",
  "spotify",
  "square",
  "stock",
  "stripe",
  "subaru",
  "subway",
  "sui",
  "swap",
  "taylor",
  "telegram",
  "tiktok",
  "tinder",
  "token",
  "toyota",
  "trezor",
  "twitch",
  "ufc",
  "uni",
  "uniswap",
  "usdc",
  "usdt",
  "usdtf",
  "venmo",
  "vimeo",
  "visa",
  "volvo",
  "wallet",
  "wasm",
  "web3",
  "wechat",
  "whatsapp",
  "wise",
  "youtube",
  "zap",
  "zara",
  "zidane",
].sort()

const CONTACT_HANDLE = "@IcpayOfficial"
const CONTACT_LINK = "https://x.com/icpayofficial"

export default function BrandProtectionPage() {
  const t = useTranslations("brandProtection")
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState(false)

  const query = search.trim().toLowerCase()
  const filtered = useMemo(
    () => RESERVED_BRANDS.filter((name) => name.includes(query)),
    [query]
  )

  const copyProof = async () => {
    const text = `I officially own the @<brand> brand and want to claim this reserved ICPay username.\n\nMy ICPay username: <your-username>\n\nProof of ownership: <link or document>\n\nContact: @IcpayOfficial`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-5 pt-2">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Shield01Icon} className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">{t("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Search */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          variant="search"
          size="default"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Reserved list */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {search.trim()
              ? t("results", { count: filtered.length })
              : t("allReserved", { count: RESERVED_BRANDS.length })}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            {t("noneFound", { query: search.trim() })}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((name) => (
              <li key={name} className="flex items-center gap-3 py-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <HugeiconsIcon
                    icon={Crown02Icon}
                    className="size-4 text-muted-foreground"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">@{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t("brandHandle")}
                  </p>
                </div>
                <Badge variant="secondary">{t("reserved")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Contact / proof card */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Crown02Icon} className="size-5 text-primary" />
          <h2 className="text-sm font-semibold">{t("ownItTitle")}</h2>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("ownItBody")}</p>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href={CONTACT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            {CONTACT_HANDLE}
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={copyProof}
            className="h-8 gap-1.5 rounded-full text-xs"
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
            {copied ? t("copied") : t("copyTemplate")}
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t("proofHint")}</p>
      </section>
    </div>
  )
}
