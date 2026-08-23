"use client"

import { reactionGifUrl, REACTIONS, type ReactionCode } from "@/lib/community/reactions"
import { cn } from "@/lib/ui/utils"

export function CommunityReactionIcon({
  code,
  size = 22,
  className,
}: {
  code: ReactionCode
  size?: number
  className?: string
}) {
  const label = REACTIONS.find((r) => r.code === code)?.id ?? "reaction"

  return (
    <img
      src={reactionGifUrl(code)}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
      title={label}
    />
  )
}
