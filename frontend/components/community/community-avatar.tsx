"use client"

import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { communityAvatarUri } from "@/lib/community/avatar"
import { channelInitial } from "@/lib/community/format"
import { cn } from "@/lib/ui/utils"

export function CommunityAvatar({
  seed,
  name,
  className,
  size = "lg",
}: {
  seed: string
  name: string
  className?: string
  size?: "default" | "sm" | "lg"
}) {
  const uri = useMemo(() => communityAvatarUri(seed), [seed])

  return (
    <Avatar size={size} className={cn("border border-border", className)}>
      <AvatarImage src={uri} alt="" />
      <AvatarFallback className="bg-muted text-sm font-semibold">
        {channelInitial(name)}
      </AvatarFallback>
    </Avatar>
  )
}
