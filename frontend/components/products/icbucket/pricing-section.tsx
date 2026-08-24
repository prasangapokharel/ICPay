import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      capacity: "1GB",
      price: "1 ICP",
      usd: "~$3",
      features: [
        "1GB storage capacity",
        "Unlimited file uploads",
        "Public & private buckets",
        "API key authentication",
        "Chunked uploads",
        "File metadata & tags",
        "HTTPS access",
        "Pay once, store forever",
      ],
      popular: false,
    },
    {
      name: "Pro",
      capacity: "5GB",
      price: "3 ICP",
      usd: "~$9",
      features: [
        "5GB storage capacity",
        "Unlimited file uploads",
        "Public & private buckets",
        "Multiple API keys",
        "Parallel chunked uploads",
        "Advanced search & filtering",
        "Custom metadata",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Business",
      capacity: "10GB",
      price: "5 ICP",
      usd: "~$15",
      features: [
        "10GB storage capacity",
        "Unlimited file uploads",
        "Multiple buckets",
        "Team API keys",
        "Bulk operations",
        "File versioning (planned)",
        "Advanced analytics",
        "Dedicated support",
      ],
      popular: false,
    },
    {
      name: "Enterprise",
      capacity: "50GB-100GB",
      price: "Custom",
      usd: "Contact us",
      features: [
        "50GB or 100GB capacity",
        "Unlimited file uploads",
        "Unlimited buckets",
        "Organization management",
        "SLA guarantee",
        "Custom integrations",
        "White-label options",
        "24/7 priority support",
      ],
      popular: false,
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Pay once, store forever. No hidden fees, no monthly subscriptions. Choose the
              capacity that fits your needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-visible ${plan.popular ? "border-primary shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                    <div className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="space-y-3 pb-6 pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </CardDescription>
                  <CardDescription className="text-sm">{plan.usd} USD</CardDescription>
                  <CardDescription className="pt-2 text-base font-semibold">
                    {plan.capacity} Capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
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
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
