"use client"

import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const FAQ_IDS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
] as const

export function FaqSection() {
  const t = useTranslations("publicSite.icfalcon.faq")

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Accordion>
            {FAQ_IDS.map((id, i) => (
              <AccordionItem key={id} value={`item-${i}`}>
                <AccordionTrigger>{t(`items.${id}.question`)}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${id}.answer`)}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
