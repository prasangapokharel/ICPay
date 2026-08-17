"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { useIcpaySale } from "@/hooks/use-icpay-sale"
import { IcpayPresaleCard } from "@/components/icpay/icpay-presale-card"
import { PresaleInfoTip } from "@/components/icpay/presale-info-tip"

const ICPAY_SYMBOL = "ICPAY"

export default function IcpayPresalePage() {
  const t = useTranslations("buyIcpay")
  const tc = useTranslations("icpayToken")
  const { sale, isLoading } = useIcpaySale()

  if (isLoading && !sale) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <Link
        href="/icpay"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={1.75} />
        {tc("backToToken")}
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <PresaleInfoTip />
      </div>
      <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>

      <IcpayPresaleCard symbol={ICPAY_SYMBOL} />
    </div>
  )
}
