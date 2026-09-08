import Image from "next/image"
import Link from "next/link"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import { Card, CardContent } from "@/components/ui/card"

type CharityCampaignCardProps = {
  campaign: CharityCampaign
}

export function CharityCampaignCard({ campaign }: CharityCampaignCardProps) {
  return (
    <Link href={campaign.href} className="group block h-full">
      <Card className="flex h-full flex-col gap-0 overflow-hidden border-border/60 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={campaign.heroImage}
            alt={campaign.heroImageAlt}
            title={campaign.heroImageAlt}
            fill
            loading="lazy"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
              {campaign.countryLabel}
            </span>
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              Active relief
            </span>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
              {campaign.title}
            </h2>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {campaign.description}
            </p>
          </div>
          <span className="mt-auto inline-flex text-sm font-semibold text-primary">
            View donation QR codes →
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
