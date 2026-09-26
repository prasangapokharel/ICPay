"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

export function LandingProducts() {
  const t = useTranslations("publicSite.landing.products")

  const products = [
    {
      id: "wallet",
      href: "/login",
      image: LANDING_MEDIA.heroBanner,
      badge: "Wallet",
    },
    {
      id: "icbucket",
      href: "/icbucket",
      image: LANDING_MEDIA.icbucket,
      badge: "Cloud Storage",
    },
    {
      id: "icfalcon",
      href: "/icfalcon",
      image: LANDING_MEDIA.icfalcon,
      badge: "Framework",
    },
  ] as const

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const imageLabel = t(`items.${product.id}.title`)

            return (
              <Card
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden pt-0 transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
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

                <CardHeader>
                  <CardAction>
                    <Badge variant="secondary">{product.badge}</Badge>
                  </CardAction>
                  <CardTitle>{t(`items.${product.id}.title`)}</CardTitle>
                  <CardDescription>
                    {t(`items.${product.id}.description`)}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="mt-auto pt-0">
                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={<Link href={product.href} />}
                  >
                    {t(`items.${product.id}.cta`)}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
