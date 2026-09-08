"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon } from "@hugeicons/core-free-icons"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import { charityCampaignShellClass } from "@/lib/public/charity/shell"
import { CharityBreadcrumb } from "@/components/public/charity/charity-breadcrumb"
import { CharityHeroCarousel } from "@/components/public/charity/charity-hero-carousel"
import { Typewriter } from "@/components/shared/typewriter"
import { cn } from "@/lib/ui/utils"

type CharityCampaignHeroProps = {
  campaign: CharityCampaign
}

export function CharityCampaignHero({ campaign }: CharityCampaignHeroProps) {
  const slides = [
    { src: campaign.heroImage, alt: campaign.heroImageAlt },
    ...campaign.sceneImages,
  ]

  return (
    <section className={cn("relative overflow-hidden border-b border-border/60", charityCampaignShellClass)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-10 size-56 rotate-12 rounded-[3rem] bg-primary/20 dark:bg-primary/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-0 size-72 -rotate-6 rounded-[4rem] bg-primary/15 dark:bg-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/3 top-1/2 size-40 -translate-y-1/2 rotate-45 rounded-[2rem] bg-primary/10 dark:bg-primary/10"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <CharityBreadcrumb
          className="text-foreground/70 [&_a:hover]:text-foreground [&_span]:text-foreground/80"
          items={[
            { label: "Charity", href: "/charity" },
            { label: campaign.countryLabel, href: "/charity" },
            { label: campaign.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-80 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
              <HugeiconsIcon icon={Location01Icon} className="size-4 shrink-0" strokeWidth={2} />
              {campaign.countryLabel} • Emergency Relief • Since 2026
            </span>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                {campaign.h1}
              </h1>
              <p className="max-w-xl min-h-24 text-base leading-relaxed text-foreground/80 md:min-h-28 md:text-lg">
                <Typewriter text={campaign.subtitle} speed={28} />
              </p>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-foreground/70">
              ICPay does not collect or hold donations. Use the official government QR codes below
              or visit{" "}
              <a
                href={campaign.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                pmdrf.nchl.com.np
              </a>
              .
            </p>
          </div>

          <CharityHeroCarousel slides={slides} />
        </div>
      </div>
    </section>
  )
}
