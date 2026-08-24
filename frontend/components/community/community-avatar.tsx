"use client"

import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCommunityChannelAvatar } from "@/hooks/community/useCommunityChannelAvatar"
import { channelAvatarDataUrl } from "@/lib/community/channelAvatar"
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
  slug,
  previewBytes,
  className,
  size = "lg",
  pixelSize,
}: {
  seed: string
  name: string
  slug?: string
  previewBytes?: Uint8Array
  className?: string
  size?: "default" | "sm" | "lg"
  pixelSize?: number
}) {
  const pixels = pixelSize ?? PIXEL_SIZE[size]
  const generated = useMemo(() => communityAvatarUri(seed, pixels), [seed, pixels])
  const cached = useCommunityChannelAvatar(slug ?? "")
  const bytes = previewBytes ?? cached
  const custom = useMemo(
    () => (bytes?.length ? channelAvatarDataUrl(bytes) : undefined),
    [bytes]
  )
  const uri = custom ?? generated

  return (
    <Avatar size={size} className={cn("border border-border/60 bg-background", className)}>
      <AvatarImage src={uri} alt="" className="object-cover" />
      <AvatarFallback className="bg-muted text-sm font-semibold">
        {channelInitial(name)}
      </AvatarFallback>
    </Avatar>
  )
}
