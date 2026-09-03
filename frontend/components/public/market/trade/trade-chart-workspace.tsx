"use client"

import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradeChartPanel } from "@/components/public/market/trade/trade-chart-panel"
import { TradeInfoTabs } from "@/components/public/market/trade/trade-info-tabs"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeChartWorkspace({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")

  return (
    <Card size="sm" className="m-1 flex h-full min-h-[320px] flex-col gap-0 overflow-hidden py-0">
      <Tabs defaultValue="chart" className="flex h-full min-h-0 flex-col gap-0">
        <TabsList variant="line" className="w-full shrink-0 justify-start border-b px-4">
          <TabsTrigger value="chart">{t("tabChart")}</TabsTrigger>
          <TabsTrigger value="info">{t("tabInfo")}</TabsTrigger>
          <TabsTrigger value="data">{t("tabData")}</TabsTrigger>
          <TabsTrigger value="analysis">{t("tabAnalysis")}</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <TradeChartPanel snapshot={snapshot} loading={loading} bare />
        </TabsContent>
        <TabsContent value="info" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <TradeInfoTabs snapshot={snapshot} section="token" bare />
        </TabsContent>
        <TabsContent value="data" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <TradeInfoTabs snapshot={snapshot} section="pool" bare />
        </TabsContent>
        <TabsContent value="analysis" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <TradeInfoTabs snapshot={snapshot} section="pair" bare />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
