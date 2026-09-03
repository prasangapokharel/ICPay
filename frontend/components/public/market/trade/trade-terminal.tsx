"use client"

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TradeMarketWatchlist } from "@/components/public/market/trade/trade-market-watchlist"
import { TradePairToolbar } from "@/components/public/market/trade/trade-pair-toolbar"
import { TradePairMarquee } from "@/components/public/market/trade/trade-pair-marquee"
import { TradeChartWorkspace } from "@/components/public/market/trade/trade-chart-workspace"
import { TradeSwapHistory } from "@/components/public/market/trade/trade-swap-history"
import { TradeOrderPanel } from "@/components/public/market/trade/trade-order-panel"
import { TradeWalletDialog } from "@/components/public/market/trade/trade-wallet-dialog"
import { TradeFillAlert } from "@/components/public/market/trade/trade-fill-alert"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { useTerminalWatchlist, useTradePairSnapshot } from "@/hooks/market/useTradeTerminal"
import { canSelectTradeBase } from "@/lib/market/tradePairs"
import { ledgerForPairSlug, tradePairHref } from "@/lib/market/pairSlug"
import {
  getCustomWatchlistServerSnapshot,
  getCustomWatchlistSnapshot,
  mergeWatchlistRows,
  parseCustomWatchlist,
  saveCustomWatchlist,
  subscribeCustomWatchlist,
  upsertCustomWatchlist,
} from "@/lib/market/customWatchlist"
import { TradeSeoHead } from "@/components/public/market/trade/trade-seo-head"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"
import { useIsTradeDesktop } from "@/hooks/market/useTradeLayout"

function TradeStackedLayout({
  snapshot,
  pairLoading,
  rows,
  listLoading,
  activeBase,
  onSelect,
  onAddCustomToken,
  onOpenWalletTrade,
  pinnedIds,
}: {
  snapshot: ReturnType<typeof useTradePairSnapshot>["snapshot"]
  pairLoading: boolean
  rows: ReturnType<typeof useTerminalWatchlist>["rows"]
  listLoading: boolean
  activeBase: string
  onSelect: (id: string) => void
  onAddCustomToken: (row: TerminalPairRow) => void
  onOpenWalletTrade: () => void
  pinnedIds?: Iterable<string>
}) {
  return (
    <div className="flex flex-col gap-2 p-2 pb-8">
      <TradeMarketWatchlist
        rows={rows}
        activeBaseId={activeBase}
        activeLogoUrl={snapshot?.base.logoUrl}
        onSelect={onSelect}
        onAddCustomToken={onAddCustomToken}
        loading={listLoading}
        pinnedIds={pinnedIds}
      />
      <TradeChartWorkspace snapshot={snapshot} loading={pairLoading} />
      <TradeSwapHistory snapshot={snapshot} />
      <TradeOrderPanel
        snapshot={snapshot}
        loading={pairLoading}
        rows={rows}
        activeBaseId={activeBase}
        listLoading={listLoading}
        onSelectPair={onSelect}
        onOpenWalletTrade={onOpenWalletTrade}
      />
    </div>
  )
}

export function TradeTerminal() {
  return (
    <ErrorBoundary title="Trade terminal failed to load">
      <TradeTerminalInner />
    </ErrorBoundary>
  )
}

function TradeTerminalInner() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const routeParams = useParams()
  const isTradeDesktop = useIsTradeDesktop()
  const [transferOpen, setTransferOpen] = useState(false)

  const { rows, isLoading: listLoading } = useTerminalWatchlist()
  const customSerialized = useSyncExternalStore(
    subscribeCustomWatchlist,
    getCustomWatchlistSnapshot,
    getCustomWatchlistServerSnapshot
  )
  const customTokens = useMemo(
    () => parseCustomWatchlist(customSerialized),
    [customSerialized]
  )
  const customIds = useMemo(
    () => new Set(customTokens.map((row) => row.baseLedgerId)),
    [customTokens]
  )
  const allRows = useMemo(() => mergeWatchlistRows(rows, customTokens), [rows, customTokens])
  const listed = useMemo(
    () => allRows.map((row) => ({ symbol: row.base.symbol, ledgerId: row.baseLedgerId })),
    [allRows]
  )

  const pairParam = typeof routeParams.pair === "string" ? routeParams.pair : ""
  const baseFromUrl = params.get("base")
  const fromSlug = pairParam ? ledgerForPairSlug(pairParam, listed, baseFromUrl) : null

  const activeBase = useMemo(() => {
    if (baseFromUrl && canSelectTradeBase(baseFromUrl)) return baseFromUrl
    if (fromSlug && canSelectTradeBase(fromSlug)) return fromSlug
    return allRows[0]?.baseLedgerId ?? ""
  }, [baseFromUrl, fromSlug, allRows])

  const hrefForRow = useCallback(
    (row: TerminalPairRow, list = listed) =>
      tradePairHref(row.base.symbol, row.baseLedgerId, list, customIds.has(row.baseLedgerId)),
    [listed, customIds]
  )

  const selectPair = useCallback(
    (baseLedgerId: string) => {
      const row = allRows.find((item) => item.baseLedgerId === baseLedgerId)
      const href = row
        ? hrefForRow(row)
        : `/market/trade?base=${encodeURIComponent(baseLedgerId)}`
      router.replace(href, { scroll: false })
    },
    [router, allRows, hrefForRow]
  )

  const handleAddCustomToken = useCallback((row: TerminalPairRow) => {
    saveCustomWatchlist(upsertCustomWatchlist(customTokens, row))
    const nextListed = [
      { symbol: row.base.symbol, ledgerId: row.baseLedgerId },
      ...listed.filter((item) => item.ledgerId !== row.baseLedgerId),
    ]
    router.replace(
      tradePairHref(row.base.symbol, row.baseLedgerId, nextListed, true),
      { scroll: false }
    )
  }, [customTokens, listed, router])

  const cachedStats = allRows.find((r) => r.baseLedgerId === activeBase)?.stats ?? null
  const { snapshot, isLoading: pairLoading } = useTradePairSnapshot(
    activeBase || null,
    cachedStats
  )

  useEffect(() => {
    if (!snapshot || listed.length === 0) return
    if (snapshot.baseLedgerId !== activeBase) return
    const keepBase = customIds.has(snapshot.baseLedgerId) || snapshot.baseLedgerId === baseFromUrl
    const href = tradePairHref(
      snapshot.base.symbol,
      snapshot.baseLedgerId,
      listed,
      keepBase
    )
    const current = baseFromUrl
      ? `${pathname}?base=${encodeURIComponent(baseFromUrl)}`
      : pathname
    if (current === href) return
    router.replace(href, { scroll: false })
  }, [snapshot, listed, pathname, baseFromUrl, router, activeBase, customIds])

  const openWalletFromOrder = useCallback(() => {
    if (!snapshot) return
    setTransferOpen(true)
  }, [snapshot])

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-[32rem] flex-col overflow-hidden bg-background pb-2">
      {snapshot ? (
        <TradeSeoHead
          symbol={snapshot.base.symbol}
          quoteSymbol={snapshot.quote.symbol}
          name={snapshot.base.name}
          priceUsd={snapshot.stats?.priceUsd}
        />
      ) : null}
      <TradePairMarquee
        rows={rows}
        quoteSymbol={snapshot?.quote.symbol ?? "ICP"}
        loading={listLoading}
        onSelect={selectPair}
      />
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
            className="h-full overflow-hidden p-2"
          >
            <TradeMarketWatchlist
              rows={allRows}
              activeBaseId={activeBase}
              activeLogoUrl={snapshot?.base.logoUrl}
              onSelect={selectPair}
              onAddCustomToken={handleAddCustomToken}
              loading={listLoading}
              pinnedIds={customIds}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id="terminal-center"
            defaultSize="58%"
            minSize="38%"
            className="h-full overflow-hidden p-2"
          >
            <ResizablePanelGroup orientation="vertical" className="h-full gap-2">
              <ResizablePanel
                id="terminal-chart"
                defaultSize="68%"
                minSize="40%"
                className="h-full overflow-hidden"
              >
                <TradeChartWorkspace snapshot={snapshot} loading={pairLoading} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="terminal-swaps"
                defaultSize="32%"
                minSize="22%"
                className="h-full overflow-hidden"
              >
                <TradeSwapHistory snapshot={snapshot} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id="terminal-order"
            defaultSize="25%"
            minSize="22%"
            maxSize="34%"
            className="h-full overflow-hidden p-2"
          >
            <TradeOrderPanel
              snapshot={snapshot}
              loading={pairLoading}
              rows={allRows}
              activeBaseId={activeBase}
              listLoading={listLoading}
              onSelectPair={selectPair}
              onOpenWalletTrade={openWalletFromOrder}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TradeStackedLayout
            snapshot={snapshot}
            pairLoading={pairLoading}
            rows={allRows}
            listLoading={listLoading}
            activeBase={activeBase}
            onSelect={selectPair}
            onAddCustomToken={handleAddCustomToken}
            onOpenWalletTrade={openWalletFromOrder}
            pinnedIds={customIds}
          />
        </div>
      )}

      <TradeFillAlert />
      <TradeWalletDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        snapshot={snapshot ?? null}
      />
    </div>
  )
}
