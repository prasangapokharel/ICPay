"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTokenAmount } from "@/lib/wallet-utils"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"

export function TokenList({
  holdings,
  isLoading,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
}) {
  const t = useTranslations("wallet")
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
    <ul className="space-y-0.5">
      {holdings.map((token) => (
        <TokenRow key={token.ledgerId} token={token} />
      ))}
    </ul>
  )
}

function TokenRow({ token }: { token: TokenHolding }) {
  const t = useTranslations("wallet")
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  return (
    <li className="flex items-center gap-3 rounded-2xl px-1 py-2.5">
      <TokenLogo token={token} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{token.symbol}</p>
          {/* Stated on the row rather than behind a tooltip: these funds really
              are stuck until the canister learns to spend non-ICP ledgers, and
              a hover affordance would never appear on a phone. */}
          {!isIcp && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
              {t("receiveOnly")}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{token.name}</p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums">
        {formatTokenAmount(token.balance, token.decimals)}
      </p>
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
