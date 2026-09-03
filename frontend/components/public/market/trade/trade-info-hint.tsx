"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TradeInfoHint({ label, text }: { label: string; text: string }) {
  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          aria-label={label}
          className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" strokeWidth={1.75} />
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-xs text-left">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
