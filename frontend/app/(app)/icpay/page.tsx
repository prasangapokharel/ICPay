"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { useIcpaySale } from "@/hooks/icpay/useIcpaySale"
import { IcpayTokenCard } from "@/components/icpay/icpay-token-card"
import { formatTokenAmount } from "@/lib/wallet/utils"

export default function IcpayTokenPage() {
  const t = useTranslations("icpayToken")
  const { stats, isLoading } = useIcpayStats()
  const { sale } = useIcpaySale()

  if (isLoading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  const symbol = stats?.symbol ?? "ICPAY"

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/icpay/presale" />}>
          {t("viewPresale")}
        </Button>
      </div>

      {sale?.active && stats && (
        <Link
          href="/icpay/presale"
          className="block rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
        >
          <span className="font-medium text-foreground">{t("presaleLive")}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
            {formatTokenAmount(sale.inventoryRemaining, stats.decimals, 0)} {symbol} {t("presaleLeft")}
          </span>
        </Link>
      )}

      <IcpayTokenCard />
    </div>
  )
}
