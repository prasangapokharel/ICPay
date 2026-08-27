"use client"

import { formatAmount, formatTokenAmount } from "@/lib/wallet/utils"
import { Spinner } from "@/components/ui/spinner"
import type { IcpaySaleQuote } from "@/services/icpay/sale"

const ICP_DECIMALS = 8

export function PresaleStatsPanel({
  sale,
  symbol,
  isLoading,
  remainingLabel,
  raisedLabel,
  inactiveLabel,
}: {
  sale: IcpaySaleQuote | undefined
  symbol: string
  isLoading: boolean
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

  const percent = Math.min(100, Number(sale.percentSold))
  const percentLabel = percent.toFixed(2)

  return (
    <div className="space-y-3">
      <div className="shrink-0 tabular-nums text-xs text-muted-foreground">
        {formatTokenAmount(sale.icpaySold, ICP_DECIMALS, 0)} /{" "}
        {formatTokenAmount(sale.inventoryCap, ICP_DECIMALS, 0)} {symbol}
      </div>

      <div className="space-y-1">
        <p className="text-right text-xs font-medium tabular-nums text-foreground">{percentLabel}%</p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tabular-nums text-muted-foreground">
        <span>{remainingLabel(formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0), symbol)}</span>
        <span aria-hidden>·</span>
        <span>{raisedLabel(formatAmount(sale.icpRaised))}</span>
      </div>

      {!sale.active && (
        <p className="text-center text-xs font-medium text-amber-500">{inactiveLabel}</p>
      )}
    </div>
  )
}
