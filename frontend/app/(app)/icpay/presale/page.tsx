"use client"

import { useTranslations } from "next-intl"
import { Spinner } from "@/components/ui/spinner"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { IcpayPresaleHero } from "@/components/icpay/icpay-presale-hero"
import { AppPage } from "@/components/layout/dashboard/app-page"

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
    <AppPage title={t("heroTitle")} description={t("pageSubtitle")}>
      <IcpayPresaleHero symbol={symbol} />
    </AppPage>
  )
}
