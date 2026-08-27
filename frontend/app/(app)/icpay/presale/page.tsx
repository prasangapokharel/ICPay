"use client"

import { useTranslations } from "next-intl"
import { Spinner } from "@/components/ui/spinner"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { IcpayPresaleHero } from "@/components/icpay/icpay-presale-hero"

const ICPAY_SYMBOL = "ICPAY"

export default function IcpayPresalePage() {
  const t = useTranslations("buyIcpay")
  const { stats, isLoading } = useIcpayStats()

  if (isLoading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  const symbol = stats?.symbol ?? ICPAY_SYMBOL

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("heroTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>
      </div>
      <IcpayPresaleHero symbol={symbol} />
    </div>
  )
}
