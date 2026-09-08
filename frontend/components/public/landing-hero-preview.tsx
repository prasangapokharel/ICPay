"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { cn } from "@/lib/ui/utils"

type PreviewView = "mobile" | "desktop"

const VIEWS: PreviewView[] = ["mobile", "desktop"]

export function LandingHeroPreview() {
  const t = useTranslations("publicSite.landing.hero")
  const [view, setView] = useState<PreviewView>("mobile")
  const isMobile = view === "mobile"

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          "relative mx-auto w-full",
          isMobile ? "max-w-[280px] sm:max-w-[300px]" : "max-w-full"
        )}
      >
        <Image
          src={isMobile ? LANDING_MEDIA.heroMockup : LANDING_MEDIA.heroDesktop}
          alt={isMobile ? t("imageAlt") : t("imageAltDesktop")}
          title={isMobile ? t("imageAlt") : t("imageAltDesktop")}
          width={isMobile ? 800 : 2240}
          height={isMobile ? 1280 : 1260}
          priority={isMobile}
          className="w-full rounded-lg"
          style={{ height: "auto" }}
        />
      </div>

      <div
        className="mt-6 flex border-b border-border/50"
        role="tablist"
        aria-label={t("previewTabsLabel")}
      >
        {VIEWS.map((id) => {
          const active = view === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(id)}
              className={cn(
                "relative flex-1 pb-3 text-center text-sm font-medium",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {t(id === "mobile" ? "previewMobile" : "previewDesktop")}
              {active ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
