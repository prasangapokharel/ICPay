"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"

export function TokenList({
  holdings,
  isLoading,
  outside,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  // Balances sitting at the user's own principal rather than in ICPay, keyed by
  // ledger. Only the ledgers we can actually sweep are in it.
  outside?: Map<string, bigint>
}) {
  const t = useTranslations("wallet")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return holdings
    return holdings.filter(
      (token) =>
        token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q),
    )
  }, [holdings, query])

  if (isLoading && holdings.length === 0) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-1 py-2.5">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        {t("noTokens")}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchTokens")}
          className="rounded-full bg-muted/60 pl-10 shadow-none focus-visible:bg-background"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">
          {t("noTokensFound")}
        </p>
      ) : (
        <ul className="space-y-0.5">
          {filtered.map((token) => (
            <TokenRow
              key={token.ledgerId}
              token={token}
              // Below the fee it cannot be moved, so naming it would only send the
              // user to a page whose button is disabled.
              outside={
                (outside?.get(token.ledgerId) ?? 0n) > token.fee
                  ? outside!.get(token.ledgerId)!
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function TokenRow({ token, outside }: { token: TokenHolding; outside?: bigint }) {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const href = `/token/${token.ledgerId}`
  return (
    <li>
      <Link
        href={href}
        prefetch
        onMouseEnter={() => prefetchAppRoute(href, identity)}
        onFocus={() => prefetchAppRoute(href, identity)}
        className="flex items-center gap-3 rounded-2xl px-1 py-2.5 transition-colors hover:bg-muted/60 active:scale-[0.99]"
      >
        <TokenLogo token={token} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{token.symbol}</p>
          <p className="truncate text-xs text-muted-foreground">{token.name}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums">
            {formatTokenAmount(token.balance, token.decimals)}
          </p>
          {/* The amount, not just a flag: someone holding their whole launched
              supply outside custody sees a zero row otherwise, and the number is
              what tells them the sweep is worth opening. */}
          {outside !== undefined && (
            <p className="mt-0.5 text-[11px] font-medium tabular-nums text-primary">
              {t("outsideAmount", {
                amount: formatTokenAmount(outside, token.decimals),
              })}
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}

function TokenLogo({ token }: { token: TokenHolding }) {
  // ICP ships no icrc1:logo, and its mark is already a local asset.
  const src = token.ledgerId === ICP_LEDGER_ID ? "/images/logo/logo.png" : token.logo

  if (!src) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
        {token.symbol.slice(0, 2)}
      </span>
    )
  }

  return (
    <Image
      // The ledger logos are inline SVG data URIs, which next/image cannot
      // process; unoptimized is already the project-wide default anyway.
      src={src}
      alt=""
      width={36}
      height={36}
      unoptimized
      className="size-9 shrink-0 rounded-full object-contain"
    />
  )
}