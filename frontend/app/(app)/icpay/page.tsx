"use client"

import { useTranslations } from "next-intl"
import { Spinner } from "@/components/ui/spinner"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { IcpayTokenCard } from "@/components/icpay/icpay-token-card"
import { AppPage } from "@/components/layout/dashboard/app-page"

export default function IcpayTokenPage() {
  const t = useTranslations("icpayToken")
  const { stats, isLoading } = useIcpayStats()

  if (isLoading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      <IcpayTokenCard />
    </AppPage>
  )
}
