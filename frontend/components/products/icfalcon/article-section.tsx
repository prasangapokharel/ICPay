"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"

export function ArticleSection() {
  const t = useTranslations("publicSite.icfalcon.article")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <article className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("frameworkTitle")}</h3>
              <p>{t("frameworkP1")}</p>
              <p className="mt-3">{t("frameworkP2")}</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("layeringTitle")}</h3>
              <p>{t("layeringP1")}</p>
              <p className="mt-3">{t("layeringP2")}</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("frontendTitle")}</h3>
              <p>{t("frontendP1")}</p>
              <p className="mt-3">{t("frontendP2")}</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("cliTitle")}</h3>
              <p>{t("cliP1")}</p>
              <p className="mt-3">{t("cliP2")}</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("hubTitle")}</h3>
              <p>{t("hubP1")}</p>
              <p className="mt-3">{t("hubP2")}</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xs">
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("audienceTitle")}</h3>
              <p>{t("audienceP1")}</p>
              <p className="mt-3">{t("audienceP2")}</p>
            </div>

            <Card className="border-border/60 bg-card/70 backdrop-blur-xs shadow-sm">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">{t("stackTitle")}</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <span className="block text-xs font-semibold text-foreground">{t("stackBackend")}</span>
                    <span className="mt-1 block font-mono text-xs text-muted-foreground">{t("stackBackendValue")}</span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <span className="block text-xs font-semibold text-foreground">{t("stackFrontend")}</span>
                    <span className="mt-1 block font-mono text-xs text-muted-foreground">{t("stackFrontendValue")}</span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <span className="block text-xs font-semibold text-foreground">{t("stackTooling")}</span>
                    <span className="mt-1 block font-mono text-xs text-muted-foreground">{t("stackToolingValue")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </article>
      </div>
    </section>
  )
}
