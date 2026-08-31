"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TradeMarketWatchlist } from "@/components/public/market/trade/trade-market-watchlist"
import { TradePairToolbar } from "@/components/public/market/trade/trade-pair-toolbar"
import { TradeChartPanel } from "@/components/public/market/trade/trade-chart-panel"
import { TradeInfoTabs } from "@/components/public/market/trade/trade-info-tabs"
import { TradeOrderPanel } from "@/components/public/market/trade/trade-order-panel"
import { useTerminalWatchlist, useTradePairSnapshot } from "@/hooks/market/useTradeTerminal"
import { defaultTerminalBase, isTerminalPairBase } from "@/lib/market/tradePairs"
import { useIsMobile } from "@/hooks/use-mobile"

export function TradeTerminal() {
  const router = useRouter()
  const params = useSearchParams()
  const isMobile = useIsMobile()

  const baseFromUrl = params.get("base")
  const activeBase = useMemo(() => {
    if (baseFromUrl && isTerminalPairBase(baseFromUrl)) return baseFromUrl
    return defaultTerminalBase()
  }, [baseFromUrl])

  const selectPair = useCallback(
    (baseLedgerId: string) => {
      router.replace(`/market/trade?base=${baseLedgerId}`, { scroll: false })
    },
    [router]
  )

  const { rows, isLoading: listLoading } = useTerminalWatchlist()
  const { snapshot, isLoading: pairLoading } = useTradePairSnapshot(activeBase)

  if (isMobile) {
    return (
      <div className="flex min-h-[calc(100svh-8rem)] flex-col">
        <TradePairToolbar snapshot={snapshot} loading={pairLoading} />
        <TradeMarketWatchlist
          rows={rows}
          activeBaseId={activeBase}
          onSelect={selectPair}
          loading={listLoading}
        />
        <TradeChartPanel snapshot={snapshot} loading={pairLoading} />
        <TradeInfoTabs snapshot={snapshot} />
        <TradeOrderPanel snapshot={snapshot} loading={pairLoading} />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      <TradePairToolbar snapshot={snapshot} loading={pairLoading} />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={18} minSize={14} maxSize={28}>
          <TradeMarketWatchlist
            rows={rows}
            activeBaseId={activeBase}
            onSelect={selectPair}
            loading={listLoading}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={57} minSize={40}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={62} minSize={35}>
              <TradeChartPanel snapshot={snapshot} loading={pairLoading} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={38} minSize={24}>
              <TradeInfoTabs snapshot={snapshot} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={20} maxSize={34}>
          <TradeOrderPanel snapshot={snapshot} loading={pairLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
