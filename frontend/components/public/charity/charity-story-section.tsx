import type { CharityCampaign } from "@/lib/public/charity/campaigns"

type CharityStorySectionProps = {
  campaign: CharityCampaign
}

export function CharityStorySection({ campaign }: CharityStorySectionProps) {
  const sections = campaign.storySections ?? []

  return (
    <section className="border-b border-border/60 bg-muted/10 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:gap-20">
          <div className="space-y-3 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Impact</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl lg:leading-tight">
              {campaign.story.heading}
            </h2>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg md:leading-8">
            {campaign.story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>

        {sections.length > 0 ? (
          <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6 lg:mt-20">
            {sections.map((section) => (
              <article
                key={section.heading}
                className="flex h-full flex-col rounded-2xl border border-border/60 bg-background p-6 shadow-sm md:p-8"
              >
                <h3 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                  {section.heading}
                </h3>
                <div className="mt-4 flex flex-1 flex-col gap-4 text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2 lg:gap-6">
          {campaign.story.updates?.length ? (
            <div className="rounded-2xl border border-border/60 bg-background p-6 md:p-8">
              <h3 className="text-base font-semibold text-foreground md:text-lg">Please note</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {campaign.story.updates.map((note) => (
                  <li key={note.slice(0, 40)} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {campaign.sources?.length ? (
            <div className="rounded-2xl border border-border/60 bg-background p-6 md:p-8">
              <h3 className="text-base font-semibold text-foreground md:text-lg">Sources</h3>
              <ul className="mt-4 space-y-3 text-sm md:text-base">
                {campaign.sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-relaxed text-primary underline-offset-4 hover:underline"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
