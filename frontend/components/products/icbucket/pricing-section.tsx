"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import {
  BUCKET_POPULAR_TIER_GB,
  calculateListPriceE8s,
  calculatePriceE8s,
} from "@/lib/bucket/pricing"
import { formatUsd } from "@/lib/market/icpPrice"
import { formatAmount } from "@/lib/wallet/utils"

type PriceCurrency = "icp" | "usd"

const PLAN_DEFS = [
  { id: "starter", capacityGb: 1 },
  { id: "pro", capacityGb: 5 },
  { id: "business", capacityGb: 10 },
  { id: "scale", capacityGb: 50 },
] as const

function icpFromE8s(e8s: bigint): number {
  return Number(e8s) / 1e8
}

function formatIcp(e8s: bigint): string {
  return `${formatAmount(e8s)} ICP`
}

function formatPlanPrice(
  e8s: bigint,
  currency: PriceCurrency,
  usdPerIcp: number | undefined
): string {
  if (currency === "icp") return formatIcp(e8s)
  if (usdPerIcp === undefined) return "…"
  return formatUsd(icpFromE8s(e8s) * usdPerIcp)
}

const FEATURE_IDS = ["0", "1", "2", "3", "4", "5", "6"] as const

export function PricingSection() {
  const t = useTranslations("publicSite.icbucket.pricing") as (
    key: string,
    values?: Record<string, string | number>
  ) => string
  const [currency, setCurrency] = useState<PriceCurrency>("icp")
  const { price, loading } = useIcpPrice()
  const usdPerIcp = price?.usd

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
            <Tabs
              value={currency}
              onValueChange={(value) => setCurrency((value as PriceCurrency) ?? "icp")}
              className="flex justify-center pt-2"
            >
              <TabsList className="h-10 rounded-full p-1">
                <TabsTrigger value="icp" className="min-w-16 rounded-full px-5">
                  {t("currencyIcp")}
                </TabsTrigger>
                <TabsTrigger value="usd" className="min-w-16 rounded-full px-5">
                  {t("currencyUsd")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {currency === "usd" ? (
              <p className="text-xs text-muted-foreground">
                {loading || !price
                  ? t("loadingPrice")
                  : t("priceHint", { price: formatUsd(price.usd) })}
              </p>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLAN_DEFS.map((plan) => {
              const priceE8s = calculatePriceE8s(plan.capacityGb)
              const listPriceE8s = calculateListPriceE8s(plan.capacityGb)
              const showDiscount = listPriceE8s > priceE8s
              const popular = plan.capacityGb === BUCKET_POPULAR_TIER_GB

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-visible ${popular ? "border-primary shadow-lg" : ""}`}
                >
                  {popular ? (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                      <div className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
                        {t("mostPopular")}
                      </div>
                    </div>
                  ) : null}
                  <CardHeader className="space-y-3 pb-6 pt-8">
                    <CardTitle className="text-2xl">{t(`plans.${plan.id}.name`)}</CardTitle>
                    <div className="space-y-1">
                      {showDiscount ? (
                        <p className="text-lg text-muted-foreground line-through tabular-nums">
                          {formatPlanPrice(listPriceE8s, currency, usdPerIcp)}
                        </p>
                      ) : null}
                      <CardDescription className="text-4xl font-bold text-foreground tabular-nums">
                        {formatPlanPrice(priceE8s, currency, usdPerIcp)}
                      </CardDescription>
                      <CardDescription className="text-sm">{t("per30Days")}</CardDescription>
                    </div>
                    <CardDescription className="pt-2 text-base font-semibold">
                      {t("capacity", { capacityGb: plan.capacityGb })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {FEATURE_IDS.map((featureId) => (
                        <li key={featureId} className="flex items-start gap-2">
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            className="mt-0.5 size-5 shrink-0 text-primary"
                          />
                          <span className="text-sm text-muted-foreground">
                            {t(`plans.${plan.id}.features.${featureId}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link href="https://icpay.app/bucket">
                      <Button
                        className="w-full"
                        variant={popular ? "default" : "outline"}
                        size="lg"
                      >
                        {t("getStarted")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            {t("footer")}
            {currency === "usd" ? t("footerCheckoutIcp") : null}
          </p>
        </div>
      </div>
    </section>
  )
}
