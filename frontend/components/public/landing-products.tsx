import Image from "next/image"
import Link from "next/link"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { Card, CardContent } from "@/components/ui/card"

const PRODUCTS = [
  {
    title: "ICPay Wallet",
    description: "Send, receive, and hold ICP with a username handle and Internet Identity.",
    href: "/login",
    cta: "Open wallet",
    image: LANDING_MEDIA.heroBanner,
  },
  {
    title: "ICBucket",
    description: "On-chain cloud storage with API keys, SDKs, and 30-day ICP plans.",
    href: "/icbucket",
    cta: "Explore storage",
    image: LANDING_MEDIA.icbucket,
  },
  {
    title: "ICFalcon",
    description: "Production Motoko framework with layered architecture and a global CLI.",
    href: "/icfalcon",
    cta: "Build on ICP",
    image: LANDING_MEDIA.icfalcon,
  },
] as const

export function LandingProducts() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Ecosystem
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Everything built on ICPay
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Wallet, storage, and canister tooling in one stack — designed for builders and
            everyday users on the Internet Computer.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link key={product.title} href={product.href} className="group block h-full">
              <Card className="flex h-full flex-col gap-0 overflow-hidden border-border/60 bg-card p-0 shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <CardContent className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {product.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <span className="mt-auto inline-flex text-sm font-semibold text-primary">
                    {product.cta} →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
