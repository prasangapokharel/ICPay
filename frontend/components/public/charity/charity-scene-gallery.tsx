import Image from "next/image"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"

type CharitySceneGalleryProps = {
  campaign: CharityCampaign
}

export function CharitySceneGallery({ campaign }: CharitySceneGalleryProps) {
  if (campaign.sceneImages.length === 0) return null

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">On the ground</p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Nepal flash flood scenes
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Communities across Nepal are recovering from sudden floods and landslides triggered by
            intense monsoon rain.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaign.sceneImages.map((scene) => (
            <div
              key={scene.src}
              className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20"
            >
              <Image
                src={scene.src}
                alt={scene.alt}
                title={scene.alt}
                width={1280}
                height={853}
                loading="lazy"
                className="w-full"
                style={{ height: "auto" }}
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
