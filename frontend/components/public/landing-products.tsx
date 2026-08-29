"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { Card, CardContent } from "@/components/ui/card"

export function LandingProducts() {
  const t = useTranslations("publicSite.landing.products")

  const products = [
    { id: "wallet", href: "/login", image: LANDING_MEDIA.heroBanner },
    { id: "icbucket", href: "/icbucket", image: LANDING_MEDIA.icbucket },
    { id: "icfalcon", href: "/icfalcon", image: LANDING_MEDIA.icfalcon },
  ] as const

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={product.href} className="group block h-full">
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
                    {t(`items.${product.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${product.id}.description`)}
                  </p>
                  <span className="mt-auto inline-flex text-sm font-semibold text-primary">
                    {t(`items.${product.id}.cta`)} →
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
