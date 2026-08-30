"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { PAGE_IMAGES } from "@/lib/public/page-images"
import { DESKTOP_DOWNLOADS } from "@/lib/public/downloads"
import { cn } from "@/lib/ui/utils"

const PLATFORM_IDS = ["windows", "linux", "macos"] as const

const PLATFORM_META: Record<
  (typeof PLATFORM_IDS)[number],
  {
    icon: string
    iconClassName?: string
    href?: string
    comingSoon?: boolean
  }
> = {
  windows: { icon: PAGE_IMAGES.downloads.windows, href: DESKTOP_DOWNLOADS.windows },
  linux: { icon: PAGE_IMAGES.downloads.fedora, href: DESKTOP_DOWNLOADS.linuxRpm },
  macos: {
    icon: PAGE_IMAGES.downloads.macos,
    iconClassName: "dark:invert",
    comingSoon: true,
  },
}

export function LandingDownloads() {
  const t = useTranslations("publicSite.landing.downloads")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-start space-y-6">
          <div className="max-w-xl space-y-2">
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

          <div className="flex w-full max-w-md flex-col gap-3">
            {PLATFORM_IDS.map((id) => {
              const meta = PLATFORM_META[id]

              return (
                <Card
                  key={id}
                  className="border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background p-1.5">
                      <Image
                        src={meta.icon}
                        alt=""
                        width={20}
                        height={20}
                        className={cn("size-5 object-contain", meta.iconClassName)}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold leading-snug text-foreground">
                        {t(`platforms.${id}.title`)}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t(`platforms.${id}.body`)}
                      </p>
                    </div>

                    {meta.comingSoon || !meta.href ? (
                      <Button size="sm" variant="outline" disabled className="shrink-0">
                        {t("comingSoon")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        nativeButton={false}
                        className="shrink-0"
                        render={<a href={meta.href} download />}
                      >
                        {t("download")}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}

            <Card className="border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background p-1.5">
                  <Image
                    src={PAGE_IMAGES.downloads.linux}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold leading-snug text-foreground">
                    {t("debTitle")}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("debBody")}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="shrink-0"
                  render={<a href={DESKTOP_DOWNLOADS.linuxDeb} download />}
                >
                  {t("download")}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
          <Image
            src={LANDING_MEDIA.laptopMockup}
            alt={t("imageAlt")}
            title={t("imageAlt")}
            width={2240}
            height={1260}
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full"
            style={{ height: "auto" }}
          />
        </div>
      </div>
    </section>
  )
}
