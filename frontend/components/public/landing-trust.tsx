"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ICPAY_CANISTERS, TRUST_LINK_DEFS } from "@/lib/public/trust-links"

export function LandingTrust() {
  const t = useTranslations("publicSite.landing.trust") as (
    key: string,
    values?: Record<string, string | number>
  ) => string

  const trustLinks = TRUST_LINK_DEFS.map((def) => {
    const canisterId =
      def.id === "backendCanister"
        ? ICPAY_CANISTERS.backend
        : def.id === "frontendCanister"
          ? ICPAY_CANISTERS.frontend
          : undefined

    return {
      ...def,
      label: t(`items.${def.id}.label`),
      description: canisterId
        ? t(`items.${def.id}.description`, { canisterId })
        : t(`items.${def.id}.description`),
    }
  })

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustLinks.map((item) => {
            const content = (
              <Card className="h-full border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                    {item.external ? t("visit") : t("readMore")}
                  </span>
                </CardContent>
              </Card>
            )

            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {content}
                </a>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
