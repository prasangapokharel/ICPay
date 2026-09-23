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

      <div className="mt-6 flex justify-center">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-xs backdrop-blur-xs"
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
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(id === "mobile" ? "previewMobile" : "previewDesktop")}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

