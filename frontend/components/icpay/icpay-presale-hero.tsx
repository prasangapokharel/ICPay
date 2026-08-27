"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { useIcpaySale } from "@/hooks/icpay/useIcpaySale"
import { BuyIcpayDrawer } from "@/components/icpay/buy-icpay-drawer"
import { PresaleStatsPanel } from "@/components/icpay/presale-stats-panel"
import { PresaleGuideDialog } from "@/components/icpay/presale-guide-dialog"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { BgImageCard } from "@/components/ui/bg-image-card"
import { hasSeenPresaleGuide } from "@/lib/icpay/presaleGuide"

export function IcpayPresaleHero({ symbol }: { symbol: string }) {
  const t = useTranslations("buyIcpay")
  const { identity } = useAuth()
  const { sale, isLoading } = useIcpaySale()
  const [buyOpen, setBuyOpen] = useState(false)
  const [manualGuideOpen, setManualGuideOpen] = useState(false)
  const guideOpen =
    manualGuideOpen || Boolean(sale?.active && !hasSeenPresaleGuide())

  return (
    <section className="space-y-4">
      <BgImageCard minHeight="min-h-[28rem]" contentClassName="space-y-6 px-5 py-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex size-13 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/images/logo/icpay/token.png"
                  alt=""
                  width={52}
                  height={52}
                  unoptimized
                  className="size-full object-cover"
                />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">{t("heroTitle")}</h2>
                  {sale?.active && <GradientBadge>{t("liveBadge")}</GradientBadge>}
                </div>
                <p className="text-xs text-muted-foreground">{t("heroSubtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setManualGuideOpen(true)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("viewGuide")}
            >
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="py-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("rateInfoTitle")}
            </p>
            <p className="mt-2 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent tabular-nums">
              {t("heroRate")}
            </p>
          </div>

          <PresaleStatsPanel
            sale={sale}
            symbol={symbol}
            isLoading={isLoading}
            remainingLabel={(amount, sym) => t("remaining", { amount, symbol: sym })}
            raisedLabel={(icp) => t("raised", { icp })}
            inactiveLabel={t("soldOut")}
          />

          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {t("liquidityInfo")}
          </div>

          {identity ? (
            <Button
              className="w-full"
              disabled={!sale?.active}
              onClick={() => setBuyOpen(true)}
            >
              {sale?.active ? t("openBuy") : t("soldOut")}
            </Button>
          ) : (
            <Button
              className="w-full"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              {t("loginToBuy")}
            </Button>
          )}
      </BgImageCard>

      <PresaleGuideDialog
        open={guideOpen}
        onOpenChange={(open) => setManualGuideOpen(open)}
      />
      {buyOpen ? (
        <BuyIcpayDrawer open={buyOpen} onOpenChange={setBuyOpen} symbol={symbol} />
      ) : null}
    </section>
  )
}
