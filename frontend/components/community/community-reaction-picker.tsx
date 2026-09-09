"use client"

import { Button } from "@/components/ui/button"
import { CommunityReactionIcon } from "@/components/community/community-reaction-icon"
import { REACTIONS, type ReactionCode } from "@/lib/community/reactions"
import { cn } from "@/lib/ui/utils"

export function CommunityReactionPicker({
  onPick,
  activeCode = null,
  disabled,
  className,
}: {
  onPick: (code: ReactionCode) => void
  activeCode?: ReactionCode | null
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5 px-1 py-1.5", className)}>
      {REACTIONS.map((reaction) => {
        const picked = activeCode === reaction.code
        return (
          <Button
            key={reaction.code}
            variant="ghost"
            size="icon"
            disabled={disabled || picked}
            aria-label={reaction.id}
            aria-pressed={picked}
            className={cn(
              picked
                ? "cursor-default opacity-40"
                : "hover:bg-muted/70 active:scale-95 disabled:opacity-50"
            )}
            onClick={() => {
              if (picked) return
              onPick(reaction.code)
            }}
          >
            <CommunityReactionIcon code={reaction.code} size={28} />
          </Button>
        )
      })}
    </div>
  )
}
