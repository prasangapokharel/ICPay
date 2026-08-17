"use client"

import { formatAmount, formatTokenAmount } from "@/lib/wallet-utils"
import { Spinner } from "@/components/ui/spinner"
import type { IcpaySaleQuote } from "@/services/icpay/sale"

const ICP_DECIMALS = 8

export function PresaleStatsPanel({
  sale,
  symbol,
  isLoading,
  progressLabel,
  remainingLabel,
  raisedLabel,
  inactiveLabel,
}: {
  sale: IcpaySaleQuote | undefined
  symbol: string
  isLoading: boolean
  progressLabel: (percent: string) => string
  remainingLabel: (amount: string, symbol: string) => string
  raisedLabel: (icp: string) => string
  inactiveLabel: string
}) {
  if (isLoading && !sale) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!sale) return null

  const percent = Number(sale.percentSold)

  return (
    <div className="space-y-3 rounded-2xl border border-foreground/10 bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{progressLabel(String(percent))}</span>
        <span className="shrink-0 tabular-nums">
          {formatTokenAmount(sale.icpaySold, ICP_DECIMALS, 0)} /{" "}
          {formatTokenAmount(sale.inventoryCap, ICP_DECIMALS, 0)} {symbol}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tabular-nums text-muted-foreground">
        <span>{remainingLabel(formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0), symbol)}</span>
        <span aria-hidden>·</span>
        <span>{raisedLabel(formatAmount(sale.icpRaised))}</span>
      </div>
      {!sale.active && (
        <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-500">{inactiveLabel}</p>
      )}
    </div>
  )
}
