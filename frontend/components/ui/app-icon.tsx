import Image from "next/image"
import { cn } from "@/lib/ui/utils"
import { appIcons, type AppIconName } from "@/lib/ui/appIcons"

export type { AppIconName }

export function AppIcon({
  name,
  size = 22,
  mono = false,
  priority = false,
  className,
}: {
  name: AppIconName
  size?: number
  mono?: boolean
  priority?: boolean
  className?: string
}) {
  return (
    <Image
      src={appIcons[name]}
      alt=""
      width={size}
      height={size}
      unoptimized
      priority={priority}
      className={cn("shrink-0 object-contain", mono && "invert dark:invert-0", className)}
    />
  )
}
