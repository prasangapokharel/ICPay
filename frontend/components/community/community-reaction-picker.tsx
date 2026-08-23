"use client"

import { CommunityReactionIcon } from "@/components/community/community-reaction-icon"
import { REACTIONS, type ReactionCode } from "@/lib/community/reactions"
import { cn } from "@/lib/ui/utils"

export function CommunityReactionPicker({
  onPick,
  disabled,
  className,
}: {
  onPick: (code: ReactionCode) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-center gap-0.5 px-1 py-1.5", className)}>
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.code}
          type="button"
          disabled={disabled}
          aria-label={reaction.id}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted/70 active:scale-95 disabled:opacity-50"
          onClick={() => onPick(reaction.code)}
        >
          <CommunityReactionIcon code={reaction.code} size={28} />
        </button>
      ))}
    </div>
  )
}
