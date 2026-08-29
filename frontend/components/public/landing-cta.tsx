"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function LandingCta() {
  const t = useTranslations("publicSite.landing.cta")
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </section>
    )
  }

  if (isAuthenticated) {
    return (
      <section className="bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t("signedInTitle")}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("signedInBody")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/home" />}
              className="h-11 rounded-full px-7"
            >
              {t("openWallet")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/channels" />}
              className="h-11 rounded-full px-7"
            >
              {t("browseChannels")}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("readyTitle")}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("readyBody")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/login" />}
            className="h-11 rounded-full px-7"
          >
            {t("signIn")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/channels" />}
            className="h-11 rounded-full px-7"
          >
            {t("browseChannels")}
          </Button>
        </div>
      </div>
    </section>
  )
}
