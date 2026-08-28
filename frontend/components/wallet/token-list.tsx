"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { type TokenHolding } from "@/services/tokens"
import { TokenLogo } from "@/components/token/token-logo"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"

export function TokenList({
  holdings,
  isLoading,
  outside,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  outside?: Map<string, bigint>
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
        <TokenRow
          key={token.ledgerId}
          token={token}
          outside={
            (outside?.get(token.ledgerId) ?? 0n) > token.fee
              ? outside!.get(token.ledgerId)!
              : undefined
          }
        />
      ))}
    </ul>
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
        className="flex items-center gap-3 rounded-2xl px-1 py-2.5"
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
