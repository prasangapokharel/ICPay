"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { formatUsd, formatUsdPrecise } from "@/lib/market/icpPrice"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"
import { formatTokenAmount, shortPrincipal, copyText } from "@/lib/wallet/utils"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { InfoTip } from "@/components/icpay/info-tip"
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
  const minting = stats.mintingAccount

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src={ICPAY_TOKEN_ICON}
          alt=""
          width={56}
          height={56}
          unoptimized
          className="size-14 shrink-0 rounded-full object-contain"
        />
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {market ? formatUsdPrecise(market.priceUsd) : t("unpriced")}
            </p>
            {market && (
              <InfoTip
                label={t("priceInfoTitle")}
                title={t("priceInfoTitle")}
                body={t("priceInfo")}
                className="mt-1"
              />
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {stats.name} ({stats.symbol})
          </p>
        </div>
        {market && (
          <div className="flex items-center gap-1.5">
            <p
              className={`text-sm font-medium tabular-nums ${
                change > 0 ? "text-emerald-500" : change < 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change.toFixed(2)}% {t("change24h")}
            </p>
            <InfoTip label={t("change24hInfoTitle")} title={t("change24hInfoTitle")} body={t("change24hInfo")} />
          </div>
        )}

        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<a href={ICPAY_INFO_URL} target="_blank" rel="noreferrer noopener" />}
          >
            {t("chart")}
          </Button>
          <Button
            className="w-full"
            nativeButton={false}
            render={<a href={ICPAY_SWAP_URL} target="_blank" rel="noreferrer noopener" />}
          >
            {t("swap", { symbol: stats.symbol })}
          </Button>
        </div>
      </div>

      <Card size="sm">
        <CardContent className="divide-y divide-foreground/10 p-0">
          <MetricRow
            label={t("totalSupply")}
            value={formatTokenAmount(stats.totalSupply, stats.decimals, 0)}
            infoTitle={t("supplyInfoTitle")}
            infoBody={t("supplyInfo")}
          />
          {fdv !== null && (
            <MetricRow
              label={t("fdv")}
              value={formatUsd(fdv)}
              infoTitle={t("fdvInfoTitle")}
              infoBody={t("fdvInfo")}
            />
          )}
          {market && (
            <MetricRow
              label={t("tvl")}
              value={formatUsd(market.tvlUsd)}
              infoTitle={t("tvlInfoTitle")}
              infoBody={t("tvlInfo")}
            />
          )}
          {market && (
            <MetricRow
              label={t("volume24h")}
              value={formatUsd(market.volume24hUsd)}
              infoTitle={t("volume24hInfoTitle")}
              infoBody={t("volume24hInfo")}
            />
          )}
          {market && (
            <MetricRow label={t("trades24h")} value={String(market.txCount24h)} />
          )}
          {market && market.priceLow24h > 0 && (
            <MetricRow
              label={t("range24h")}
              value={`${formatUsdPrecise(market.priceLow24h)} – ${formatUsdPrecise(market.priceHigh24h)}`}
            />
          )}
          <MetricRow label={t("decimals")} value={String(stats.decimals)} />
          <MetricRow
            label={t("fee")}
            value={`${formatTokenAmount(stats.fee, stats.decimals)} ${stats.symbol}`}
          />
          <MetricRow
            label={t("canisterId")}
            value={shortPrincipal(ICPAY_LEDGER_ID)}
            onClick={() => copyText(ICPAY_LEDGER_ID)}
          />
          {minting && (
            <MetricRow
              label={t("mintingAccount")}
              value={stats.supplyFixed ? t("mintingAccountNone") : shortPrincipal(minting)}
              onClick={() => copyText(minting)}
              infoTitle={t("mintingInfoTitle")}
              infoBody={t("mintingInfo")}
            />
          )}
        </CardContent>
      </Card>

      {!market && <p className="text-center text-xs text-muted-foreground">{t("marketUnavailable")}</p>}
    </section>
  )
}

function MetricRow({
  label,
  value,
  infoTitle,
  infoBody,
  onClick,
}: {
  label: string
  value: string
  infoTitle?: string
  infoBody?: string
  onClick?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {infoTitle && infoBody && (
          <InfoTip label={infoTitle} title={infoTitle} body={infoBody} />
        )}
      </span>
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
