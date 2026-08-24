import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Copy01Icon,
  DashboardSquare02Icon,
  Delete02Icon,
  Forward01Icon,
  GiftIcon,
  Message01Icon,
  MoreVerticalIcon,
  Pin02Icon,
  Search01Icon,
  SentIcon,
  Settings01Icon,
  Share08Icon,
  Tick02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"

const ICONS = {
  back: ArrowLeft01Icon,
  more: MoreVerticalIcon,
  pin: Pin02Icon,
  copy: Copy01Icon,
  forward: Forward01Icon,
  delete: Delete02Icon,
  share: Share08Icon,
  send: SentIcon,
  arrowDown: ArrowDown01Icon,
  community: Message01Icon,
  gift: GiftIcon,
  home: DashboardSquare02Icon,
  search: Search01Icon,
  upload: Upload01Icon,
  settings: Settings01Icon,
  check: Tick02Icon,
} as const

export type CommunityIconName = keyof typeof ICONS

export function CommunityIcon({
  name,
  size = 20,
  className,
}: {
  name: CommunityIconName
  size?: number
  className?: string
}) {
  return (
    <HugeiconsIcon
      icon={ICONS[name]}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      strokeWidth={1.75}
    />
  )
}
