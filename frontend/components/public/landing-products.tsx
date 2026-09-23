"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
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
          {products.map((product) => {
            const imageLabel = t(`items.${product.id}.title`)

            return (
              <Link key={product.id} href={product.href} className="group block h-full">
                <Card className="flex h-full flex-col gap-0 overflow-hidden border-border/60 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg">
                  <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden bg-muted">
                    <Image
                      src={product.image}
                      alt={imageLabel}
                      title={imageLabel}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex flex-1 flex-col justify-between gap-3 p-5">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {t(`items.${product.id}.title`)}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t(`items.${product.id}.description`)}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-transform duration-200 group-hover:translate-x-1">
                      <span>Explore</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
