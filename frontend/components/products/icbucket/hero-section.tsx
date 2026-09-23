"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HeroSignOptions } from "@/components/public/hero-sign-options"
import { Button } from "@/components/ui/button"
import { PAGE_IMAGES } from "@/lib/public/page-images"

export function HeroSection() {
  const t = useTranslations("publicSite.icbucket.hero")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="space-y-6">
          <p className="shimmer text-xs font-semibold uppercase tracking-[0.24em] text-primary shimmer-duration-3000">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {t("title")}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("tagline")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/bucket" />}
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
            >
              {t("github")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/bucket/docs" />}
            >
              {t("packages")}
            </Button>
          </div>
          <HeroSignOptions />
        </div>

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center bg-transparent lg:max-w-lg">
          <Image
            src={PAGE_IMAGES.icbucket.hero}
            alt={t("imageAlt")}
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 1024px) 100vw, 512px"
            className="w-full bg-transparent object-contain select-none"
            style={{ height: "auto" }}
          />
        </div>
      </div>
    </section>
  )
}
