"use client"

import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { communityAvatarUri } from "@/lib/community/avatar"
import { channelInitial } from "@/lib/community/format"
import { cn } from "@/lib/ui/utils"

const PIXEL_SIZE = {
  sm: 48,
  default: 80,
  lg: 128,
} as const

export function CommunityAvatar({
  seed,
  name,
  className,
  size = "lg",
  pixelSize,
}: {
  seed: string
  name: string
  className?: string
  size?: "default" | "sm" | "lg"
  pixelSize?: number
}) {
  const pixels = pixelSize ?? PIXEL_SIZE[size]
  const uri = useMemo(() => communityAvatarUri(seed, pixels), [seed, pixels])

  return (
    <Avatar size={size} className={cn("border border-border/60 bg-background", className)}>
      <AvatarImage src={uri} alt="" className="object-cover" />
      <AvatarFallback className="bg-muted text-sm font-semibold">
        {channelInitial(name)}
      </AvatarFallback>
    </Avatar>
  )
}
