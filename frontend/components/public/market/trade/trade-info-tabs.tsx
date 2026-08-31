"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { formatUsd } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeInfoTabs({ snapshot }: { snapshot: TradePairSnapshot | undefined }) {
  const t = useTranslations("marketTrade")
  if (!snapshot) return null

  const stats = snapshot.stats
  const feeLabel =
    snapshot.pool !== null ? `${(snapshot.pool.fee / 10_000).toFixed(2)}%` : "—"

  return (
    <Tabs defaultValue="pool" className="flex h-full flex-col px-4 pb-4 pt-2">
      <TabsList className="w-full justify-start bg-muted/40">
        <TabsTrigger value="pool">{t("tabPool")}</TabsTrigger>
        <TabsTrigger value="token">{t("tabToken")}</TabsTrigger>
        <TabsTrigger value="pair">{t("tabPair")}</TabsTrigger>
      </TabsList>

      <TabsContent value="pool" className="mt-3 flex-1 space-y-2.5 text-sm">
        <InfoRow label={t("poolId")} value={snapshot.pool?.poolId ?? t("noPool")} mono />
        <InfoRow label={t("poolFee")} value={feeLabel} />
        <InfoRow label={t("tvl")} value={formatUsd(stats?.tvlUsd)} />
        <InfoRow label={t("tvlChange24h")} value={formatPctLike(stats?.tvlChange24h)} />
        <InfoRow label={t("volume24h")} value={formatUsd(stats?.volume24hUsd)} />
        <InfoRow label={t("volume7d")} value={formatUsd(stats?.volume7dUsd)} />
        <InfoRow label={t("tx24h")} value={stats?.txCount24h?.toLocaleString() ?? "—"} />
      </TabsContent>

      <TabsContent value="token" className="mt-3 flex-1 space-y-2.5 text-sm">
        <InfoRow label={t("symbol")} value={snapshot.base.symbol} />
        <InfoRow label={t("name")} value={snapshot.base.name} />
        <InfoRow label={t("decimals")} value={String(snapshot.base.decimals)} />
        <InfoRow
          label={t("transferFee")}
          value={`${formatTokenAmount(snapshot.base.fee, snapshot.base.decimals)} ${snapshot.base.symbol}`}
        />
        <InfoRow
          label={t("totalSupply")}
          value={formatTokenAmount(snapshot.base.totalSupply, snapshot.base.decimals)}
        />
        <InfoRow label={t("mintingAccount")} value={snapshot.base.mintingAccount ?? "—"} mono />
        <InfoRow
          label={t("supplyFixed")}
          value={
            snapshot.supplyFixed === null
              ? "—"
              : snapshot.supplyFixed
                ? t("yes")
                : t("no")
          }
        />
        <InfoRow label={t("indexCanister")} value={snapshot.base.indexCanisterId ?? "—"} mono />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {snapshot.base.supportedStandards.map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pair" className="mt-3 flex-1 space-y-2.5 text-sm">
        <InfoRow label={t("pair")} value={`${snapshot.base.symbol} / ${snapshot.quote.symbol}`} />
        <InfoRow label={t("baseLedger")} value={snapshot.base.ledgerId} mono />
        <InfoRow label={t("quoteLedger")} value={snapshot.quote.ledgerId} mono />
        <InfoRow
          label={t("spotRate")}
          value={
            snapshot.spotRate !== null
              ? `${snapshot.spotRate.toPrecision(6)} ${snapshot.quote.symbol}`
              : "—"
          }
        />
        <InfoRow label={t("quoteSource")} value={t("quoteSourceOnChain")} />
        <InfoRow label={t("statsSource")} value="api.icpswap.com" />
        <InfoRow label={t("ledgerSource")} value={t("ledgerSourceOnChain")} />
      </TabsContent>
    </Tabs>
  )
}

function formatPctLike(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/30 py-1.5 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={mono ? "max-w-[58%] break-all text-right font-mono text-[11px]" : "text-right font-medium"}>
        {value}
      </span>
    </div>
  )
}
