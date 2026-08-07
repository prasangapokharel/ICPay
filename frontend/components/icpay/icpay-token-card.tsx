"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { formatUsd, formatUsdPrecise } from "@/lib/use-icp-price"
import { formatTokenAmount, shortPrincipal, copyText } from "@/lib/wallet-utils"
import { useIcpayStats } from "@/hooks/use-icpay-stats"
import {
  fullyDilutedValue,
  ICPAY_LEDGER_ID,
  ICPAY_SWAP_URL,
  ICPAY_INFO_URL,
} from "@/services/icpay/icpay"

export function IcpayTokenCard() {
  const t = useTranslations("icpayToken")
  const { stats, isLoading } = useIcpayStats()

  if (isLoading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }
  if (!stats) return null

  const { market } = stats
  const fdv = fullyDilutedValue(stats)
  const change = market?.priceChange24h ?? 0

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/images/logo/logo.png"
          alt=""
          width={56}
          height={56}
          unoptimized
          className="size-14 shrink-0 rounded-full object-contain"
        />
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {market ? formatUsdPrecise(market.priceUsd) : t("unpriced")}
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            {stats.name} ({stats.symbol})
          </p>
        </div>
        {market && (
          <p
            className={`text-sm font-medium tabular-nums ${
              change > 0 ? "text-emerald-500" : change < 0 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}% {t("change24h")}
          </p>
        )}

        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full gap-1"
            nativeButton={false}
            render={<a href={ICPAY_INFO_URL} target="_blank" rel="noreferrer noopener" />}
          >
            {t("chart")}
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </Button>
          <Button
            className="w-full gap-1"
            nativeButton={false}
            render={<a href={ICPAY_SWAP_URL} target="_blank" rel="noreferrer noopener" />}
          >
            {t("buy", { symbol: stats.symbol })}
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </Button>
        </div>
      </div>

      <Card size="sm">
        <CardContent className="divide-y divide-foreground/10 p-0">
          <Row label={t("totalSupply")} value={formatTokenAmount(stats.totalSupply, stats.decimals, 0)} />
          {fdv !== null && <Row label={t("fdv")} value={formatUsd(fdv)} />}
          {market && <Row label={t("tvl")} value={formatUsd(market.tvlUsd)} />}
          {market && <Row label={t("volume24h")} value={formatUsd(market.volume24hUsd)} />}
          {market && <Row label={t("trades24h")} value={String(market.txCount24h)} />}
          {market && market.priceLow24h > 0 && (
            <Row
              label={t("range24h")}
              value={`${formatUsdPrecise(market.priceLow24h)} – ${formatUsdPrecise(market.priceHigh24h)}`}
            />
          )}
          <Row label={t("decimals")} value={String(stats.decimals)} />
          <Row label={t("fee")} value={`${formatTokenAmount(stats.fee, stats.decimals)} ${stats.symbol}`} />
          <Row
            label={t("canisterId")}
            value={shortPrincipal(ICPAY_LEDGER_ID)}
            onClick={() => copyText(ICPAY_LEDGER_ID)}
          />
        </CardContent>
      </Card>

      {!market && <p className="text-center text-xs text-muted-foreground">{t("marketUnavailable")}</p>}
    </div>
  )
}

function Row({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="text-xs font-medium tabular-nums hover:text-primary"
        >
          {value}
        </button>
      ) : (
        <span className="text-xs font-medium tabular-nums">{value}</span>
      )}
    </div>
  )
}
