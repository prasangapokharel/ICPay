"use client"

import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageQuestionIcon } from "@hugeicons/core-free-icons"

const FAQ_IDS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
] as const

export function FaqSection() {
  const t = useTranslations("publicSite.icbucket.faq")

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <HugeiconsIcon
              icon={MessageQuestionIcon}
              className="mx-auto size-8 text-primary"
            />
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="w-full space-y-4">
            <Accordion>
              {FAQ_IDS.map((id, index) => (
                <AccordionItem
                  key={id}
                  value={`item-${index}`}
                  className="rounded-lg border px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {t(`items.${id}.question`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(`items.${id}.answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
