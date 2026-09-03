"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { cn } from "@/lib/ui/utils"
import { buildPortfolioAssetRows } from "@/lib/market/availableAssets"
import { formatUsd, formatPct } from "@/lib/market/format"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export function TradeAvailableAssets({
  rows,
  balances,
  activeBaseId,
  loading,
  onSelect,
}: {
  rows: TerminalPairRow[]
  balances: Map<string, bigint>
  activeBaseId: string
  loading?: boolean
  onSelect: (baseLedgerId: string) => void
}) {
  const t = useTranslations("marketTrade")
  const tc = useTranslations("common")
  const assets = buildPortfolioAssetRows(rows, balances)

  return (
    <Card size="sm" className="m-1 shrink-0 gap-0 overflow-hidden py-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tc("available")}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-48 overflow-y-auto px-0 pb-1">
        {loading ? (
          <div className="space-y-2 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            {t("positionsEmpty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("colCoin")}
                </TableHead>
                <TableHead className="h-8 px-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("colAvailable")}
                </TableHead>
                <TableHead className="h-8 px-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("colPnl")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((row) => {
                const active = row.ledgerId === activeBaseId
                const pnl = row.pnl24hUsd
                const up = (pnl ?? 0) > 0
                const down = (pnl ?? 0) < 0
                return (
                  <TableRow
                    key={row.ledgerId}
                    role="button"
                    tabIndex={0}
                    aria-label={row.symbol}
                    className={cn(
                      "min-h-[3rem] cursor-pointer",
                      active && "bg-muted/60"
                    )}
                    onClick={() => onSelect(row.ledgerId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelect(row.ledgerId)
                      }
                    }}
                  >
                    <TableCell className="min-h-[3rem] px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <TokenAvatar
                          symbol={row.symbol}
                          ledgerId={row.ledgerId}
                          logoUrl={row.logoUrl}
                          className="size-5 shrink-0"
                        />
                        <span className="truncate text-xs font-medium">{row.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell className="min-h-[3rem] px-3 py-2 text-right tabular-nums">
                      <div className="text-xs font-medium">
                        {formatTokenAmount(row.balance, row.decimals, 4)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {row.valueUsd != null ? formatUsd(row.valueUsd, 2) : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="min-h-[3rem] px-3 py-2 text-right tabular-nums">
                      <div
                        className={cn(
                          "text-xs font-medium",
                          up && "text-emerald-500",
                          down && "text-destructive"
                        )}
                      >
                        {pnl == null
                          ? "—"
                          : `${up ? "+" : ""}${formatUsd(pnl, 2, { compact: false })}`}
                      </div>
                      <div
                        className={cn(
                          "text-[10px]",
                          up && "text-emerald-500/80",
                          down && "text-destructive/80",
                          !up && !down && "text-muted-foreground"
                        )}
                      >
                        {formatPct(row.change24h)}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
