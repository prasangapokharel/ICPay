import { cn } from "@/lib/ui/utils"
import { appIcons, type AppIconName } from "@/lib/ui/appIcons"

export type { AppIconName }

export function AppIcon({
  name,
  size = 22,
  mono = false,
  className,
}: {
  name: AppIconName
  size?: number
  mono?: boolean
  className?: string
}) {
  return (
    <img
      src={appIcons[name]}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={cn("shrink-0 object-contain", mono && "invert dark:invert-0", className)}
      style={{ width: size, height: size }}
    />
  )
}
