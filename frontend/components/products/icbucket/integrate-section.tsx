"use client"

import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

export function IntegrateSection() {
  const t = useTranslations("publicSite.icbucket.integrate")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl space-y-2 md:mb-12">
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

          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <video
              controls
              playsInline
              preload="none"
              className="block h-auto w-full"
              aria-label={t("videoAriaLabel")}
            >
              <source src={LANDING_MEDIA.icbucketIntegrateVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
