"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, LinkSquare02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { copyText, formatTokenAmount } from "@/lib/wallet/utils"
import { formatPct, formatUsd } from "@/lib/market/format"
import { canisterDashboardUrl, looksLikeCanisterId } from "@/lib/market/canisterLink"
import { useLedgerExtras } from "@/hooks/market/useLedgerExtras"
import { useTokenPools } from "@/hooks/market/useTokenPools"
import { isSupplyFixed } from "@/services/market/icrcLedgerFacts"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeInfoTabs({ snapshot }: { snapshot: TradePairSnapshot | undefined }) {
  const t = useTranslations("marketTrade")
  const [tab, setTab] = useState("pool")
  const { data: extras } = useLedgerExtras(
    snapshot && tab === "token" ? snapshot.baseLedgerId : null
  )
  const { pools, isLoading: poolsLoading } = useTokenPools(
    snapshot && tab === "pool" ? snapshot.baseLedgerId : null
  )

  if (!snapshot) {
    return (
      <Card size="sm" className="m-1 h-full gap-3 p-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </Card>
    )
  }

  const mainPool = pools.find((p) => p.poolId === snapshot.pool?.poolId) ?? pools[0]

  return (
    <Card size="sm" className="m-1 h-full min-h-0 gap-0 overflow-hidden py-0">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex h-full min-h-0 flex-col pb-4 pt-1"
      >
      <TabsList variant="line" className="w-full justify-start border-b px-4">
        <TabsTrigger value="pool">{t("tabPool")}</TabsTrigger>
        <TabsTrigger value="token">{t("tabToken")}</TabsTrigger>
        <TabsTrigger value="pair">{t("tabPair")}</TabsTrigger>
      </TabsList>

      <TabsContent value="pool" className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-3 text-sm">
        {poolsLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </>
        ) : mainPool ? (
          <>
            <InfoRow label={t("poolId")} value={mainPool.poolId} mono />
            <InfoRow label={t("poolPair")} value={`${mainPool.token0Symbol} / ${mainPool.token1Symbol}`} />
            <InfoRow label={t("poolFee")} value={`${(mainPool.poolFee / 10_000).toFixed(2)}%`} />
            <InfoRow label={t("tvl")} value={formatUsd(parseFloat(mainPool.tvlUSD))} />
            <InfoRow label={t("tvlChange24h")} value={formatPct(parseFloat(mainPool.tvlUSDChange24H))} />
            <InfoRow label={t("volume24h")} value={formatUsd(parseFloat(mainPool.volumeUSD24H))} />
            <InfoRow label={t("volume7d")} value={formatUsd(parseFloat(mainPool.volumeUSD7D))} />
            <InfoRow label={t("tx24h")} value={mainPool.txCount24H} />
            <InfoRow label={t("fees24h")} value={formatUsd(parseFloat(mainPool.feesUSD24H))} />
            {pools.length > 1 && (
              <div className="pt-2 text-xs text-muted-foreground">
                {t("morePools", { count: pools.length - 1 })}
              </div>
            )}
          </>
        ) : (
          <InfoRow label={t("poolId")} value={t("noPool")} mono />
        )}
      </TabsContent>

      <TabsContent value="token" className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-3 text-sm">
        <InfoRow label={t("symbol")} value={snapshot.base.symbol} />
        <InfoRow label={t("name")} value={snapshot.base.name} />
        {snapshot.tokenType && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("tokenType")}</span>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {snapshot.tokenType}
            </Badge>
          </div>
        )}
        <InfoRow label={t("decimals")} value={String(snapshot.base.decimals)} />
        <InfoRow
          label={t("transferFee")}
          value={`${formatTokenAmount(snapshot.base.fee, snapshot.base.decimals)} ${snapshot.base.symbol}`}
        />
        <InfoRow
          label={t("totalSupply")}
          value={
            extras
              ? formatTokenAmount(extras.totalSupply, snapshot.base.decimals)
              : "—"
          }
        />
        {snapshot.circulatingSupply && (
          <InfoRow
            label={t("circulatingSupply")}
            value={formatTokenAmount(BigInt(snapshot.circulatingSupply), snapshot.base.decimals)}
          />
        )}
        {snapshot.maxSupply && (
          <InfoRow
            label={t("maxSupply")}
            value={formatTokenAmount(BigInt(snapshot.maxSupply), snapshot.base.decimals)}
          />
        )}
        {snapshot.holders !== undefined && (
          <InfoRow label={t("holders")} value={snapshot.holders.toLocaleString()} />
        )}
        {snapshot.transactions7d !== undefined && (
          <InfoRow label={t("transactions7d")} value={snapshot.transactions7d.toLocaleString()} />
        )}
        {snapshot.volume7d !== undefined && (
          <InfoRow label={t("volume7d")} value={formatUsd(snapshot.volume7d)} />
        )}
        <InfoRow label={t("mintingAccount")} value={extras?.mintingAccount ?? "—"} mono />
        <InfoRow
          label={t("supplyFixed")}
          value={supplyFixedLabel(extras ? isSupplyFixed(extras.mintingAccount) : null, t("yes"), t("no"))}
        />
        <InfoRow label={t("indexCanister")} value={extras?.indexCanisterId ?? "—"} mono />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(extras?.supportedStandards ?? []).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
        {snapshot.urls && (
          <div className="space-y-2 pt-2">
            {snapshot.urls.website && snapshot.urls.website.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">{t("website")}:</span>
                {snapshot.urls.website.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {new URL(url).hostname}
                  </a>
                ))}
              </div>
            )}
            {snapshot.urls.twitter && snapshot.urls.twitter.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">{t("twitter")}:</span>
                {snapshot.urls.twitter.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {url.split('/').pop()}
                  </a>
                ))}
              </div>
            )}
            {snapshot.urls.explorer && snapshot.urls.explorer.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">{t("explorer")}:</span>
                {snapshot.urls.explorer.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {new URL(url).hostname}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pair" className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-3 text-sm">
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
    </Card>
  )
}

function supplyFixedLabel(value: boolean | null, yes: string, no: string): string {
  if (value === true) return yes
  if (value === false) return no
  return "—"
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
  const t = useTranslations("marketTrade")
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)
  const canister = mono && looksLikeCanisterId(value) ? value : null

  async function copyId() {
    if (!canister) return
    await copyText(canister)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/30 py-1.5 last:border-0">
      <span className="shrink-0 text-foreground/70">{label}</span>
      <div className="flex min-w-0 flex-1 items-start justify-end gap-1.5">
        <span
          className={
            mono
              ? "break-all text-right font-mono text-[12px] leading-snug"
              : "text-right font-medium"
          }
        >
          {value}
        </span>
        {canister ? (
          <span className="flex shrink-0 items-center gap-0.5 pt-0.5">
            <button
              type="button"
              className="rounded p-0.5 text-foreground/70 hover:bg-muted hover:text-foreground"
              aria-label={copied ? tc("copied") : tc("copy")}
              onClick={() => void copyId()}
            >
              <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" strokeWidth={2} />
            </button>
            <a
              href={canisterDashboardUrl(canister)}
              target="_blank"
              rel="noreferrer"
              className="rounded p-0.5 text-foreground/70 hover:bg-muted hover:text-foreground"
              aria-label={t("openCanister")}
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" strokeWidth={2} />
            </a>
          </span>
        ) : null}
      </div>
    </div>
  )
}
