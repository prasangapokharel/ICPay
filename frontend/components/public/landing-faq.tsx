"use client"

import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ_IDS = ["0", "1", "2", "3", "4", "5"] as const

export function LandingFaq() {
  const t = useTranslations("publicSite.landing.faq")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">{t("title")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Accordion className="bg-card">
          {FAQ_IDS.map((id, index) => (
            <AccordionItem key={id} value={`faq-${index}`}>
              <AccordionTrigger className="px-3 text-left text-sm font-medium">
                {t(`items.${id}.question`)}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${id}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
