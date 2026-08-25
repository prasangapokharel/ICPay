"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
  BUCKET_POPULAR_TIER_GB,
  calculateListPriceE8s,
  calculatePriceE8s,
} from "@/lib/bucket/pricing"
import { formatAmount } from "@/lib/wallet/utils"

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

function formatIcp(e8s: bigint): string {
  return `${formatAmount(e8s)} ICP`
}

export function PricingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              30-day plans paid from your ICPay balance in ICP. No credit card. Renew anytime —
              unused time stacks.
            </p>
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
                          {formatIcp(listPriceE8s)}
                        </p>
                      ) : null}
                      <CardDescription className="text-4xl font-bold text-foreground tabular-nums">
                        {formatIcp(priceE8s)}
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

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            Prices include IC storage cycle cost plus a 20% margin, rounded to 0.5 ICP steps.
            Strikethrough shows the previous list price. Live checkout always uses the canister
            quote. Tiers up to 500 GB available in the app.
          </p>
        </div>
      </div>
    </section>
  )
}
