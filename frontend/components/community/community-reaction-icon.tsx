"use client"

import Image from "next/image"
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
    <Image
      src={reactionGifUrl(code)}
      alt=""
      aria-hidden
      unoptimized
      draggable={false}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      title={label}
    />
  )
}
