"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Cancel01Icon, PlayIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { LandingHeroPreview } from "@/components/public/landing-hero-preview"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"

const VIDEO_URL =
  "https://res.cloudinary.com/dn2ycbmrc/video/upload/v1789445491/Copy_of_Nature_Travel_Youtube_Video_Intro_zdqlhn.mp4"

export function LandingHero() {
  const t = useTranslations("publicSite.landing.hero")
  const { isAuthenticated, isLoading } = useAuth()
  const [videoOpen, setVideoOpen] = useState(false)

  const handleCloseVideo = () => {
    setVideoOpen(false)
  }

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 md:px-6 md:pt-14 md:pb-20">
        <div className="mb-8 flex justify-center sm:mb-10">
          <Link
            href="/canister/tools"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1.5 pr-2 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">
              New
            </span>
            <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
              <span className="font-medium text-foreground">
                Canister Management
              </span>
              <span className="hidden text-muted-foreground sm:inline">
                · Tools & Operations
              </span>
            </AnimatedShinyText>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            </span>
          </Link>
        </div>

        {/* Big Video Modal (Auto-shows on landing with smooth rise animation) */}
        <Dialog
          open={videoOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseVideo()
            } else {
              setVideoOpen(true)
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-[1100px] sm:max-w-[1100px] md:max-w-[1100px] lg:max-w-[1140px] p-0 border-0 bg-transparent shadow-none outline-none overflow-visible"
          >
            <DialogTitle className="sr-only">Canister Management Video Overview</DialogTitle>
            <DialogDescription className="sr-only">
              Watch the video overview for Canister Management tools on ICPay.
            </DialogDescription>

            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/95 shadow-2xl backdrop-blur-xl animate-in fade-in-0 slide-in-from-bottom-16 zoom-in-95 duration-500 ease-out">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseVideo}
                className="absolute top-4 right-4 z-30 flex size-10 items-center justify-center rounded-full bg-black/70 text-white/90 backdrop-blur-md transition-all hover:bg-black hover:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer shadow-lg"
                aria-label="Close video"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                {videoOpen && (
                  <video
                    src={VIDEO_URL}
                    controls
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleCloseVideo}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent md:text-5xl lg:text-[3.35rem] lg:leading-[1.06]">
              {t("title")}
            </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("tagline")}
          </p>
          <div className="flex flex-wrap gap-3">
            {!isLoading && isAuthenticated ? (
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/home" />}
                className="h-11 rounded-full px-7"
              >
                {t("openWallet")}
              </Button>
            ) : (
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/login" />}
                className="h-11 rounded-full px-7"
              >
                {t("signIn")}
              </Button>
            )}
            <Button
              size="lg"
              variant="ghost"
              type="button"
              onClick={() => setVideoOpen(true)}
              className="h-11 rounded-full px-4 text-muted-foreground hover:text-foreground cursor-pointer gap-2"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon icon={PlayIcon} className="size-3" />
              </span>
              <span>Watch overview</span>
            </Button>
          </div>
          <HeroSignOptions />
        </div>

        <div className="w-full lg:max-w-none">
          <LandingHeroPreview />
        </div>
      </div>
    </div>
  </section>
  )
}
