"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Typewriter } from "@/components/shared/typewriter"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { Button } from "@/components/ui/button"
import { PAGE_IMAGES } from "@/lib/public/page-images"

export function HeroSection() {
  const t = useTranslations("publicSite.icbucket.hero")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {t("title")}
          </h1>
          <p className="max-w-lg min-h-24 text-base leading-relaxed text-muted-foreground md:min-h-28 md:text-lg">
            <Typewriter text={t("tagline")} speed={28} />
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/bucket" />}
              className="h-11 rounded-full px-7"
            >
              {t("tryIcBucket")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href="https://github.com/prasangapokharel/ICPay"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="h-11 rounded-full px-7"
            >
              {t("github")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/products/icBucket/packages" />}
              className="h-11 rounded-full px-7"
            >
              {t("packages")}
            </Button>
          </div>
          <HeroSignOptions />
        </div>

        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <Image
            src={PAGE_IMAGES.icbucket.heroPhone}
            alt={t("imageAlt")}
            width={800}
            height={1280}
            priority
            className="w-full"
            style={{ height: "auto" }}
          />
        </div>
      </div>
    </section>
  )
}
