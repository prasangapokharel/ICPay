"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeInfoTabs({ snapshot }: { snapshot: TradePairSnapshot | undefined }) {
  const t = useTranslations("marketTrade")
  if (!snapshot) return null

  const stats = snapshot.stats
  const feeLabel =
    snapshot.poolFeeTier !== null ? `${(snapshot.poolFeeTier / 10_000).toFixed(2)}%` : "—"

  return (
    <Tabs defaultValue="pool" className="flex h-full flex-col px-4 pb-4">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="pool">{t("tabPool")}</TabsTrigger>
        <TabsTrigger value="token">{t("tabToken")}</TabsTrigger>
        <TabsTrigger value="pair">{t("tabPair")}</TabsTrigger>
      </TabsList>

      <TabsContent value="pool" className="mt-3 flex-1 space-y-3 text-sm">
        <InfoRow label={t("poolId")} value={snapshot.poolId ?? t("noPool")} mono />
        <InfoRow label={t("poolFee")} value={feeLabel} />
        <InfoRow label={t("tvl")} value={formatUsd(stats?.tvlUsd)} />
        <InfoRow label={t("volume24h")} value={formatUsd(stats?.volume24hUsd)} />
        <InfoRow label={t("tx24h")} value={stats?.txCount24h?.toLocaleString() ?? "—"} />
      </TabsContent>

      <TabsContent value="token" className="mt-3 flex-1 space-y-3 text-sm">
        <InfoRow label={t("symbol")} value={snapshot.baseSymbol} />
        <InfoRow label={t("decimals")} value={String(snapshot.baseDecimals)} />
        <InfoRow label={t("ledgerId")} value={snapshot.baseLedgerId} mono />
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary">ICRC</Badge>
          <Badge variant="outline">ICPSwap</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{t("icrcApiHint")}</p>
      </TabsContent>

      <TabsContent value="pair" className="mt-3 flex-1 space-y-3 text-sm">
        <InfoRow
          label={t("pair")}
          value={`${snapshot.baseSymbol} / ${snapshot.quoteSymbol}`}
        />
        <InfoRow
          label={t("quoteSource")}
          value="ICPSwap pool quote (on-chain)"
        />
        <InfoRow
          label={t("statsSource")}
          value="api.icpswap.com"
        />
        <p className="text-xs text-muted-foreground">{t("dfinityApiHint")}</p>
      </TabsContent>
    </Tabs>
  )
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
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={mono ? "break-all text-right font-mono text-xs" : "text-right font-medium"}>
        {value}
      </span>
    </div>
  )
}
