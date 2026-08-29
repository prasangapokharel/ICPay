"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { type TokenHolding, type TokenMetadata } from "@/services/tokens"
import { TokenLogo } from "@/components/token/token-logo"
import { AddTokenDrawer } from "@/components/wallet/add-token-drawer"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"

export function TokenList({
  holdings,
  isLoading,
  outside,
  existingLedgerIds = [],
  onAddCustom,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  outside?: Map<string, bigint>
  existingLedgerIds?: string[]
  onAddCustom?: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations("wallet")
  const [addOpen, setAddOpen] = useState(false)

  const listHeader = useMemo(
    () =>
      onAddCustom ? (
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="text-sm font-medium text-muted-foreground">{t("tokens")}</p>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-full"
            aria-label={t("addToken")}
            onClick={() => setAddOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null,
    [onAddCustom, t]
  )

  if (isLoading && holdings.length === 0) {
    return (
      <div className="space-y-2">
        {listHeader}
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
      <>
        {listHeader}
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">{t("noTokens")}</p>
        {onAddCustom ? (
          <AddTokenDrawer
            open={addOpen}
            onOpenChange={setAddOpen}
            existingIds={existingLedgerIds}
            onAdded={onAddCustom}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      {listHeader}
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
      {onAddCustom ? (
        <AddTokenDrawer
          open={addOpen}
          onOpenChange={setAddOpen}
          existingIds={existingLedgerIds}
          onAdded={onAddCustom}
        />
      ) : null}
    </>
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
