import Image from "next/image"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"

type CharityCrisisStatsProps = {
  campaign: CharityCampaign
}

export function CharityCrisisStats({ campaign }: CharityCrisisStatsProps) {
  if (!campaign.stats?.length) return null

  return (
    <section className="border-b border-border/60 bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Where we are</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Latest reported toll from official sources. Figures update as rescue operations continue.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-stretch lg:gap-8">
          <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
            {campaign.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-6 px-5 py-5 md:px-6 md:py-6"
              >
                <span className="text-sm font-medium text-muted-foreground md:text-base">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {campaign.statsImage ? (
            <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-border/60 bg-muted lg:min-h-0">
              <Image
                src={campaign.statsImage.src}
                alt={campaign.statsImage.alt}
                title={campaign.statsImage.alt}
                fill
                loading="lazy"
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            </div>
          ) : null}
        </div>

        {campaign.statsNote ? (
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground md:text-sm">
            {campaign.statsNote}
          </p>
        ) : null}
      </div>
    </section>
  )
}
