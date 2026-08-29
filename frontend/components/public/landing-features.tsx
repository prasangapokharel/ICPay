"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_IDS = ["0", "1", "2", "3", "4", "5"] as const

export function LandingFeatures() {
  const t = useTranslations("publicSite.landing.features")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_IDS.map((id) => (
            <Card key={id} className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t(`items.${id}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`items.${id}.body`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
