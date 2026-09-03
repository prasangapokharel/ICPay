"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function LandingCta() {
  const t = useTranslations("publicSite.landing.cta")
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("readyTitle")}</h2>
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
            render={<Link href="/market" />}
            className="h-11 rounded-full px-7"
          >
            {t("browseMarkets")}
          </Button>
        </div>
      </div>
    </section>
  )
}
