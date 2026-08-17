"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const STEPS = ["guideStep1", "guideStep2", "guideStep3", "guideStep4", "guideStep5"] as const

export function LiveGuideInfo() {
  const t = useTranslations("live")

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={t("guideTitle")}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <HugeiconsIcon icon={InformationCircleIcon} className="size-5" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-72 space-y-2 p-3 text-left">
        <p className="text-xs font-semibold">{t("guideTitle")}</p>
        <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
          {STEPS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
      </TooltipContent>
    </Tooltip>
  )
}
