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
          "relative mx-auto w-full transition-all duration-300 ease-out",
          isMobile ? "max-w-[280px] sm:max-w-[300px]" : "max-w-full"
        )}
      >
        <div key={view} className="animate-in fade-in duration-300">
          <Image
            src={isMobile ? LANDING_MEDIA.heroMockup : LANDING_MEDIA.heroDesktop}
            alt={isMobile ? t("imageAlt") : t("imageAltDesktop")}
            title={isMobile ? t("imageAlt") : t("imageAltDesktop")}
            width={isMobile ? 600 : 1152}
            height={isMobile ? 960 : 647}
            priority
            sizes={isMobile ? "(max-width: 640px) 280px, 300px" : "(max-width: 1024px) 100vw, 600px"}
            className="w-full rounded-lg"
            style={{ height: "auto" }}
          />
        </div>
      </div>

      <div
        className="relative mt-6 flex border-b border-border/50"
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
                "relative flex-1 pb-3 text-center text-sm font-medium transition-colors duration-200",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {t(id === "mobile" ? "previewMobile" : "previewDesktop")}
            </button>
          )
        })}
        <span
          className={cn(
            "absolute bottom-0 h-0.5 w-1/2 bg-primary transition-transform duration-300 ease-out",
            isMobile ? "translate-x-0" : "translate-x-full"
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

