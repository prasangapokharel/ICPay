"use client"

import { useState } from "react"
import Link from "next/link"
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

const PLANS = [
  {
    name: "Starter",
    capacityGb: 1,
    features: [
      "1 GB reserved capacity",
      "Public & private buckets",
      "API key authentication",
      "Chunked uploads",
      "Global CDN URLs",
      "Encrypted at rest",
      "Renew anytime — time stacks",
    ],
    popular: false,
  },
  {
    name: "Pro",
    capacityGb: 5,
    features: [
      "5 GB reserved capacity",
      "Multiple API keys",
      "File metadata & tags",
      "Search & folder listing",
      "Bulk copy / move / delete",
      "TypeScript, Python & Go SDKs",
      "Renew anytime — time stacks",
    ],
    popular: true,
  },
  {
    name: "Business",
    capacityGb: 10,
    features: [
      "10 GB reserved capacity",
      "Multiple buckets",
      "Team API keys",
      "Bulk operations",
      "On-chain audit trail",
      "HTTPS file delivery",
      "Renew anytime — time stacks",
    ],
    popular: false,
  },
  {
    name: "Scale",
    capacityGb: 50,
    features: [
      "50 GB reserved capacity",
      "All Business features",
      "Higher throughput uploads",
      "Production workloads",
      "dApp & NFT asset hosting",
      "Static site assets",
      "Renew anytime — time stacks",
    ],
    popular: false,
  },
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

export function PricingSection() {
  const [currency, setCurrency] = useState<PriceCurrency>("icp")
  const { price, loading } = useIcpPrice()
  const usdPerIcp = price?.usd

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Storage Economics
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Pay upfront in ICP from your ICPay balance — no credit card, no surprise monthly
              bills. Each tier is a 30-day plan; renew anytime and unused time stacks.
            </p>
            <Tabs
              value={currency}
              onValueChange={(value) => setCurrency((value as PriceCurrency) ?? "icp")}
              className="flex justify-center pt-2"
            >
              <TabsList className="h-10 rounded-full p-1">
                <TabsTrigger value="icp" className="min-w-16 rounded-full px-5">
                  ICP
                </TabsTrigger>
                <TabsTrigger value="usd" className="min-w-16 rounded-full px-5">
                  USD
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {currency === "usd" ? (
              <p className="text-xs text-muted-foreground">
                {loading || !price
                  ? "Loading live ICP price…"
                  : `USD estimates use CoinGecko · 1 ICP ≈ ${formatUsd(price.usd)}`}
              </p>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const priceE8s = calculatePriceE8s(plan.capacityGb)
              const listPriceE8s = calculateListPriceE8s(plan.capacityGb)
              const showDiscount = listPriceE8s > priceE8s
              const popular = plan.capacityGb === BUCKET_POPULAR_TIER_GB

              return (
                <Card
                  key={plan.name}
                  className={`relative overflow-visible ${popular ? "border-primary shadow-lg" : ""}`}
                >
                  {popular ? (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                      <div className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
                        Most Popular
                      </div>
                    </div>
                  ) : null}
                  <CardHeader className="space-y-3 pb-6 pt-8">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="space-y-1">
                      {showDiscount ? (
                        <p className="text-lg text-muted-foreground line-through tabular-nums">
                          {formatPlanPrice(listPriceE8s, currency, usdPerIcp)}
                        </p>
                      ) : null}
                      <CardDescription className="text-4xl font-bold text-foreground tabular-nums">
                        {formatPlanPrice(priceE8s, currency, usdPerIcp)}
                      </CardDescription>
                      <CardDescription className="text-sm">per 30 days</CardDescription>
                    </div>
                    <CardDescription className="pt-2 text-base font-semibold">
                      {plan.capacityGb} GB capacity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            className="mt-0.5 size-5 shrink-0 text-primary"
                          />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="https://icpay.app/bucket">
                      <Button
                        className="w-full"
                        variant={popular ? "default" : "outline"}
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            Live prices come from the canister: IC storage cycle cost plus a 20% margin, rounded to
            0.5 ICP steps. Strikethrough shows the previous list price. Tiers up to 500 GB are
            available in the app.
            {currency === "usd" ? " Checkout is always in ICP." : null}
          </p>
        </div>
      </div>
    </section>
  )
}
