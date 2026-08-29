"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Typewriter } from "@/components/shared/typewriter"
import { Button } from "@/components/ui/button"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

const HERO_TAGLINE =
  "ICPay is an open-source custodial wallet on the Internet Computer. Claim a handle, receive payments from anyone, and explore channels, on-chain storage, and Motoko tooling from one ecosystem."

export function LandingHero() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Internet Computer wallet
          </p>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Send ICP by username, not a 63-character address
          </h1>
          <p className="max-w-lg min-h-24 text-base leading-relaxed text-muted-foreground md:min-h-28 md:text-lg">
            <Typewriter text={HERO_TAGLINE} speed={28} />
          </p>
          <div className="flex flex-wrap gap-3">
            {!isLoading && isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/home" />}
                  className="h-11 rounded-full px-7"
                >
                  Open wallet
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/channels" />}
                  className="h-11 rounded-full px-7"
                >
                  Browse channels
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="h-11 rounded-full px-7"
                >
                  Get started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/about" />}
                  className="h-11 rounded-full px-7"
                >
                  About ICPay
                </Button>
              </>
            )}
          </div>
          <HeroSignOptions />
        </div>

        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <Image
            src={LANDING_MEDIA.heroMockup}
            alt="ICPay wallet on mobile"
            width={800}
            height={1280}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
