import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type CharityFaqSectionProps = {
  campaign: CharityCampaign
}

export function CharityFaqSection({ campaign }: CharityFaqSectionProps) {
  const faq = campaign.faq ?? []
  if (faq.length === 0) return null

  return (
    <section className="border-b border-border/60 bg-background py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Nepal flash flood FAQ
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Answers about the disaster, missing persons, and how to donate through official channels.
          </p>
        </div>

        <Accordion className="w-full bg-card">
          {faq.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm md:text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
