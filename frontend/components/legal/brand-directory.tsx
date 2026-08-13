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
  Crown02Icon,
  ArrowUpRight01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"
import { RESERVED_BRANDS } from "@/lib/reserved-brands"

const CONTACT_HANDLE = "@IcpayOfficial"
const CONTACT_LINK = "https://x.com/icpayofficial"

// Angle brackets are placeholders for the sender to fill, not markup.
const PROOF_TEMPLATE = [
  "I officially own the @<brand> brand and want to claim this reserved ICPay username.",
  "",
  "My ICPay username: <your-username>",
  "",
  "Proof of ownership: <link or document>",
  "",
  `Contact: ${CONTACT_HANDLE}`,
].join("\n")

export function BrandDirectory() {
  const t = useTranslations("brandProtection")
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState(false)

  const query = search.trim().toLowerCase()
  const filtered = useMemo(
    () => RESERVED_BRANDS.filter((name) => name.includes(query)),
    [query]
  )

  const copyProof = async () => {
    try {
      await navigator.clipboard.writeText(PROOF_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-5">
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

      <section className="space-y-2">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          {query
            ? t("results", { count: filtered.length })
            : t("allReserved", { count: RESERVED_BRANDS.length })}
        </h2>

        {filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            {t("noneFound", { query: search.trim() })}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((name) => (
              <li key={name} className="flex items-center gap-3 py-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <HugeiconsIcon icon={Crown02Icon} className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">@{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t("brandHandle")}</p>
                </div>
                <Badge variant="secondary">{t("reserved")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Crown02Icon} className="size-5 text-primary" />
          <h2 className="text-sm font-semibold">{t("ownItTitle")}</h2>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("ownItBody")}</p>

        <div className="mt-3 flex items-center gap-2">
          <a
            href={CONTACT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            {CONTACT_HANDLE}
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </a>
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

      <p className="text-xs text-muted-foreground">
        {t("buyHint")}{" "}
        <Link href="/username" className="underline underline-offset-2 hover:text-foreground">
          {t("buyLink")}
        </Link>
      </p>
    </div>
  )
}
