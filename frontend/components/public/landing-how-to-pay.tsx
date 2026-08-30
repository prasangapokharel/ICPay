"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

export function LandingHowToPay() {
  const t = useTranslations("publicSite.landing.howToPay")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="overflow-hidden">
          <Image
            src={LANDING_MEDIA.paymentFlow}
            alt={t("imageAlt")}
            title={t("imageAlt")}
            width={2240}
            height={1260}
            loading="lazy"
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="w-full"
            style={{ height: "auto" }}
          />
        </div>
      </div>
    </section>
  )
}
