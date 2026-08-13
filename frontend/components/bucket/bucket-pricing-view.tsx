"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useBucketPricingTiers } from "@/hooks/use-bucket"
import { CAPACITY_TIERS_GB } from "@/lib/bucket/bucket"
import { BUCKET_POPULAR_TIER_GB } from "@/lib/bucket/pricing"
import { formatAmount } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

const FEATURE_KEYS = [
  "pricingFeaturePublic",
  "pricingFeatureEncrypted",
  "pricingFeatureCdn",
  "pricingFeatureWebp",
  "pricingFeatureFormats",
  "pricingFeatureReadOnly",
  "pricingFeatureRenew",
] as const

export function BucketPricingView() {
  const t = useTranslations("bucket")
  const { tiers, isLoading } = useBucketPricingTiers()

  const tierRows = CAPACITY_TIERS_GB.map((gb) => {
    const tier = tiers.find((row) => row.gb === gb)
    return { gb, tier, popular: gb === BUCKET_POPULAR_TIER_GB }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-2 pb-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-auto px-2 py-1 text-muted-foreground"
        nativeButton={false}
        render={<Link href="/bucket" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        {t("back")}
      </Button>

      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("pricingTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("pricingSubtitle")}</p>
      </div>

      <section className="overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t("pricingColTier")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("pricingColPrice")}</th>
              </tr>
            </thead>
            <tbody>
              {tierRows.map(({ gb, tier, popular }) => (
                <tr
                  key={gb}
                  className={cn(
                    "border-b last:border-0",
                    popular && "bg-primary/5"
                  )}
                >
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-2 font-medium">
                      {gb} GB
                      {popular && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {t("pricingPopular")}
                        </Badge>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    {isLoading && !tier ? (
                      <Skeleton className="ml-auto inline-block h-5 w-24" />
                    ) : tier ? (
                      <span className="font-semibold">
                        {formatAmount(tier.priceE8s)}{" "}
                        <span className="font-normal text-muted-foreground">ICP</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("pricingBreakdownNote")}
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("pricingAllPlansTitle")}</h2>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {FEATURE_KEYS.map((key) => (
            <li key={key}>· {t(key)}</li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">{t("pricingFooter")}</p>

      <Button size="sm" nativeButton={false} render={<Link href="/bucket" />}>
        {t("createCta")}
      </Button>
    </div>
  )
}
