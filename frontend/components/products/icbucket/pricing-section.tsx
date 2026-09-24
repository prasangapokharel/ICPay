"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShineBorder } from "@/components/ui/shine-border"
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
  { id: "pro", capacityGb: 2 },
  { id: "business", capacityGb: 3 },
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
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("subtitle")}</p>
          <Tabs
            value={currency}
            onValueChange={(value) => setCurrency((value as PriceCurrency) ?? "icp")}
            className="flex justify-center pt-2"
          >
            <TabsList className="h-10 rounded-full p-1 border border-border/60 bg-muted/60">
              <TabsTrigger value="icp" className="min-w-16 rounded-full px-5 cursor-pointer">
                {t("currencyIcp")}
              </TabsTrigger>
              <TabsTrigger value="usd" className="min-w-16 rounded-full px-5 cursor-pointer">
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

        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_DEFS.map((plan) => {
            const priceE8s = calculatePriceE8s(plan.capacityGb)
            const listPriceE8s = calculateListPriceE8s(plan.capacityGb)
            const showDiscount = listPriceE8s > priceE8s
            const popular = plan.capacityGb === BUCKET_POPULAR_TIER_GB

            return (
              <Card
                key={plan.id}
                className={`relative overflow-visible border-border/60 bg-card rounded-2xl shadow-sm ${
                  popular ? "border-primary/40 shadow-md ring-1 ring-primary/20" : ""
                }`}
              >
                {popular && (
                  <>
                    <ShineBorder
                      className="rounded-2xl z-0"
                      borderWidth={1.5}
                      duration={12}
                      shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                    />
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                      <div className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-xs">
                        {t("mostPopular")}
                      </div>
                    </div>
                  </>
                )}
                <CardHeader className="space-y-3 pb-6 pt-8">
                  <CardTitle className="text-2xl font-bold">{t(`plans.${plan.id}.name`)}</CardTitle>
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
                  <CardDescription className="pt-2 text-base font-semibold text-foreground">
                    {t("capacity", { capacityGb: plan.capacityGb })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {FEATURE_IDS.map((featureId) => (
                      <li key={featureId} className="flex items-start gap-2.5">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="mt-0.5 size-4.5 shrink-0 text-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {t(`plans.${plan.id}.features.${featureId}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full rounded-full cursor-pointer h-11"
                    variant={popular ? "default" : "outline"}
                    size="lg"
                    nativeButton={false}
                    render={<Link href="/bucket" />}
                  >
                    {t("getStarted")}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("footer")}
          {currency === "usd" ? t("footerCheckoutIcp") : null}
        </p>
      </div>
    </section>
  )
}
