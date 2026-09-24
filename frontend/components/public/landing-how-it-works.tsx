"use client"

import { useTranslations } from "next-intl"
import { Card, CardTitle } from "@/components/ui/card"

const STEP_IDS = ["0", "1", "2", "3", "4", "5"] as const

export function LandingHowItWorks() {
  const t = useTranslations("publicSite.landing.howItWorks") as (
    key: string,
    values?: Record<string, string | number>
  ) => string

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEP_IDS.map((stepId, index) => {
            const stepNum = String(index + 1).padStart(2, "0")
            return (
              <Card
                key={stepId}
                className="group relative overflow-hidden border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/60 text-xs font-mono font-bold text-foreground">
                    {stepNum}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {t("stepLabel", { step: index + 1 })}
                  </span>
                </div>
                <CardTitle className="mb-2 text-base font-semibold text-foreground">
                  {t(`steps.${stepId}.title`)}
                </CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`steps.${stepId}.body`)}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
