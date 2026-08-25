"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { useBucketPricingTiers } from "@/hooks/bucket/useBucket"
import { CAPACITY_TIERS_GB } from "@/lib/bucket/bucket"
import { BUCKET_POPULAR_TIER_GB } from "@/lib/bucket/pricing"
import { BucketPriceLabel } from "@/components/bucket/bucket-price-label"
import { cn } from "@/lib/ui/utils"

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
      <BucketBackButton href="/bucket" />

      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("pricingTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("pricingSubtitle")}</p>
      </div>

      <Card size="sm" className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>{t("pricingColTier")}</TableHead>
                <TableHead className="text-right">{t("pricingColPrice")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tierRows.map(({ gb, tier, popular }) => (
                <TableRow
                  key={gb}
                  className={cn(popular && "bg-primary/5 hover:bg-primary/5")}
                >
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-medium">
                      {gb} GB
                      {popular && <Badge variant="secondary">{t("pricingPopular")}</Badge>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {isLoading && !tier ? (
                      <Skeleton className="ml-auto inline-block h-5 w-24" />
                    ) : tier ? (
                      <BucketPriceLabel
                        priceE8s={tier.priceE8s}
                        listPriceE8s={tier.listPriceE8s}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t">
          <CardDescription className="text-xs leading-relaxed">
            {t("pricingBreakdownNote")}
          </CardDescription>
        </CardFooter>
      </Card>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("pricingAllPlansTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {FEATURE_KEYS.map((key) => (
              <li key={key}>· {t(key)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">{t("pricingFooter")}</p>

      <Button size="sm" nativeButton={false} render={<Link href="/bucket" />}>
        {t("createCta")}
      </Button>
    </div>
  )
}
