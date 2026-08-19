"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/ui/utils"

export function BucketIconAction({
  icon,
  label,
  onClick,
  disabled,
  variant = "ghost",
  className,
  destructive,
}: {
  icon: IconSvgElement
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: "ghost" | "outline"
  className?: string
  destructive?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={destructive ? "destructive" : variant}
            size="icon-sm"
            className={cn("shrink-0", className)}
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
          >
            <HugeiconsIcon icon={icon} className="size-4" strokeWidth={1.75} />
          </Button>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
