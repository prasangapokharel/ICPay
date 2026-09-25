"use client"

import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import { ShineBorder } from "@/components/ui/shine-border"

export function IntegrateSection() {
  const t = useTranslations("publicSite.icbucket.integrate")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
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

        <div className="relative mx-auto max-w-5xl rounded-2xl">
          <ShineBorder
            className="rounded-2xl z-20"
            borderWidth={1.5}
            duration={12}
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          />
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc={LANDING_MEDIA.icbucketIntegrateVideo}
            thumbnailSrc={LANDING_MEDIA.icbucketIntegratePoster}
            thumbnailAlt={t("videoAriaLabel")}
            className="w-full drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
