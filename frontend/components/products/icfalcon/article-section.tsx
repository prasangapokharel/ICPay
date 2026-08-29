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
            <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("frameworkTitle")}</h3>
              <p>{t("frameworkP1")}</p>
              <p className="mt-3">{t("frameworkP2")}</p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("layeringTitle")}</h3>
              <p>{t("layeringP1")}</p>
              <p className="mt-3">{t("layeringP2")}</p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("frontendTitle")}</h3>
              <p>{t("frontendP1")}</p>
              <p className="mt-3">{t("frontendP2")}</p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("cliTitle")}</h3>
              <p>{t("cliP1")}</p>
              <p className="mt-3">{t("cliP2")}</p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("hubTitle")}</h3>
              <p>{t("hubP1")}</p>
              <p className="mt-3">{t("hubP2")}</p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{t("audienceTitle")}</h3>
              <p>{t("audienceP1")}</p>
              <p className="mt-3">{t("audienceP2")}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">{t("stackTitle")}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold">{t("stackBackend")}</span>
                    <span className="text-xs">{t("stackBackendValue")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold">{t("stackFrontend")}</span>
                    <span className="text-xs">{t("stackFrontendValue")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold">{t("stackTooling")}</span>
                    <span className="text-xs">{t("stackToolingValue")}</span>
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
