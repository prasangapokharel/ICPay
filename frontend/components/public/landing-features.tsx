"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudIcon,
  Message01Icon,
  ShieldIcon,
  TerminalIcon,
  ViewIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURE_CONFIG = [
  { id: "0", icon: Wallet01Icon },
  { id: "1", icon: ShieldIcon },
  { id: "2", icon: Message01Icon },
  { id: "3", icon: CloudIcon },
  { id: "4", icon: TerminalIcon },
  { id: "5", icon: ViewIcon },
] as const

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
          {FEATURE_CONFIG.map(({ id, icon: Icon }) => (
            <Card
              key={id}
              className="border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
            >
              <CardHeader className="gap-3">
                <HugeiconsIcon
                  icon={Icon}
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
                <CardTitle className="text-base font-semibold text-foreground">
                  {t(`items.${id}.title`)}
                </CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${id}.body`)}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
