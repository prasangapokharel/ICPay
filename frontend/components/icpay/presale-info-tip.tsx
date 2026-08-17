"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function PresaleInfoTip({ className }: { className?: string }) {
  const t = useTranslations("buyIcpay")

  const sections = [
    { title: t("rateInfoTitle"), body: t("rateInfo") },
    { title: t("liquidityInfoTitle"), body: t("liquidityInfo") },
    { title: t("progressInfoTitle"), body: t("progressInfo") },
    { title: t("disclosureInfoTitle"), body: t("disclosureInfo") },
  ]

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("presaleInfoTitle")}
        className={`inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground ${className ?? ""}`}
      >
        <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-sm gap-0 p-0">
        <PopoverHeader className="border-b border-foreground/10 px-4 py-3">
          <PopoverTitle className="text-sm">{t("presaleInfoTitle")}</PopoverTitle>
        </PopoverHeader>
        <div className="max-h-[min(70vh,24rem)] overflow-y-auto px-4 py-3">
          {sections.map((section, i) => (
            <div key={section.title}>
              {i > 0 && <hr className="my-3 border-foreground/10" />}
              <section>
                <p className="text-xs font-medium text-foreground">{section.title}</p>
                <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                  {section.body}
                </p>
              </section>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
