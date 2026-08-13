"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
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

  return (
    <div className="space-y-6 pt-2 pb-8">
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CAPACITY_TIERS_GB.map((gb) => {
          const tier = tiers.find((row) => row.gb === gb)
          const popular = gb === BUCKET_POPULAR_TIER_GB
          return (
            <div
              key={gb}
              className={cn(
                "relative flex flex-col rounded-2xl border p-4",
                popular && "border-primary/40 bg-primary/5"
              )}
            >
              {popular && (
                <Badge className="absolute -top-2 right-3 text-[10px]">{t("pricingPopular")}</Badge>
              )}
              <p className="text-lg font-bold">{gb} GB</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {isLoading && !tier ? (
                  <Skeleton className="inline-block h-8 w-20" />
                ) : tier ? (
                  <>
                    {formatAmount(tier.priceE8s)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">ICP</span>
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t("perMonth")}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li>· {t("public")} / {t("private")}</li>
                <li>· {t("docsEncrypted")}</li>
                <li>· {t("pricingFeatureCdn")}</li>
              </ul>
            </div>
          )
        })}
      </div>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("pricingBreakdownTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">{t("pricingColTier")}</th>
                <th className="pb-2 pr-3 font-medium">{t("pricingColCost")}</th>
                <th className="pb-2 pr-3 font-medium">{t("pricingColPrice")}</th>
                <th className="pb-2 font-medium">{t("pricingColMargin")}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.gb} className="border-b last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{tier.gb} GB</td>
                  <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                    {formatAmount(tier.costE8s)} ICP
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums font-semibold">
                    {formatAmount(tier.priceE8s)} ICP
                  </td>
                  <td className="py-2.5 tabular-nums text-muted-foreground">
                    {formatAmount(tier.marginE8s)} ICP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{t("pricingBreakdownNote")}</p>
      </section>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("pricingAllPlansTitle")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">{t("pricingColFeature")}</th>
                {CAPACITY_TIERS_GB.map((gb) => (
                  <th key={gb} className="pb-2 px-1 text-center font-medium">
                    {gb}G
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_KEYS.map((key) => (
                <tr key={key} className="border-b last:border-0">
                  <td className="py-2 pr-3 text-muted-foreground">{t(key)}</td>
                  {CAPACITY_TIERS_GB.map((gb) => (
                    <td key={gb} className="py-2 px-1 text-center">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="mx-auto size-3.5 text-primary"
                        strokeWidth={2}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">{t("pricingFooter")}</p>

      <Button size="sm" nativeButton={false} render={<Link href="/bucket" />}>
        {t("createCta")}
      </Button>
    </div>
  )
}
