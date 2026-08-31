import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/ui/utils"

export function NavIcon({
  icon,
  className,
  strokeWidth = 1.75,
}: {
  icon: IconSvgElement
  className?: string
  strokeWidth?: number
}) {
  return (
    <HugeiconsIcon icon={icon} className={cn("size-4 shrink-0", className)} strokeWidth={strokeWidth} />
  )
}
