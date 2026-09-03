import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-auto p-0 hover:bg-transparent"
            aria-label="Information"
          />
        }
      >
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="size-3.5 text-muted-foreground/60 hover:text-muted-foreground"
          strokeWidth={2}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
