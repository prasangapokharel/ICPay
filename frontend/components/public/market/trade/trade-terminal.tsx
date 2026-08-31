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
import { useIsTradeDesktop } from "@/hooks/market/useTradeLayout"

function TradeStackedLayout({
  snapshot,
  pairLoading,
  rows,
  listLoading,
  activeBase,
  onSelect,
}: {
  snapshot: ReturnType<typeof useTradePairSnapshot>["snapshot"]
  pairLoading: boolean
  rows: ReturnType<typeof useTerminalWatchlist>["rows"]
  listLoading: boolean
  activeBase: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-0">
      <TradeMarketWatchlist
        rows={rows}
        activeBaseId={activeBase}
        onSelect={onSelect}
        loading={listLoading}
      />
      <TradeChartPanel snapshot={snapshot} loading={pairLoading} />
      <div className="grid gap-0 lg:grid-cols-2">
        <TradeInfoTabs snapshot={snapshot} />
        <TradeOrderPanel snapshot={snapshot} loading={pairLoading} />
      </div>
    </div>
  )
}

export function TradeTerminal() {
  const router = useRouter()
  const params = useSearchParams()
  const isTradeDesktop = useIsTradeDesktop()

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

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-[32rem] flex-col overflow-hidden bg-background">
      <TradePairToolbar snapshot={snapshot} loading={pairLoading} />

      {isTradeDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <ResizablePanel
            id="terminal-markets"
            defaultSize="17%"
            minSize="14%"
            maxSize="26%"
            className="h-full overflow-hidden"
          >
            <TradeMarketWatchlist
              rows={rows}
              activeBaseId={activeBase}
              onSelect={selectPair}
              loading={listLoading}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id="terminal-center"
            defaultSize="58%"
            minSize="38%"
            className="h-full overflow-hidden"
          >
            <ResizablePanelGroup orientation="vertical" className="h-full">
              <ResizablePanel
                id="terminal-chart"
                defaultSize="58%"
                minSize="32%"
                className="h-full overflow-hidden"
              >
                <TradeChartPanel snapshot={snapshot} loading={pairLoading} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="terminal-info"
                defaultSize="42%"
                minSize="28%"
                className="h-full overflow-hidden"
              >
                <TradeInfoTabs snapshot={snapshot} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id="terminal-order"
            defaultSize="25%"
            minSize="22%"
            maxSize="34%"
            className="h-full overflow-hidden"
          >
            <TradeOrderPanel snapshot={snapshot} loading={pairLoading} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TradeStackedLayout
            snapshot={snapshot}
            pairLoading={pairLoading}
            rows={rows}
            listLoading={listLoading}
            activeBase={activeBase}
            onSelect={selectPair}
          />
        </div>
      )}
    </div>
  )
}
