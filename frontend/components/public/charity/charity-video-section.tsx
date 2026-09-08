"use client"

import { useEffect } from "react"
import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import { Card, CardContent } from "@/components/ui/card"

type CharityVideoSectionProps = {
  campaign: CharityCampaign
}

export function CharityVideoSection({ campaign }: CharityVideoSectionProps) {
  const videos = campaign.videos ?? []

  useEffect(() => {
    if (videos.length === 0) return

    const script = document.createElement("script")
    script.src = "https://platform.x.com/widgets.js"
    script.async = true
    script.charset = "utf-8"
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [videos.length])

  if (videos.length === 0) return null

  return (
    <section className="border-b border-border/60 bg-muted/20 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Flash flood footage from the Nepal–Tibet border
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Video clips shared on X show the scale of the debris flow that swept through valleys
            along the Nepal–China border after a glacial collapse upstream.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden border-border/60">
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{video.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {video.description}
                  </p>
                </div>
                <blockquote className="twitter-tweet" data-theme="light" data-media-max-width="560">
                  <a href={video.url}>View video on X</a>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
