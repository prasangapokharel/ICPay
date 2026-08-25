"use client"

import { CommunityReactionIcon } from "@/components/community/community-reaction-icon"
import { myReactionCode, type ReactionCode } from "@/lib/community/reactions"
import { cn } from "@/lib/ui/utils"
import type { CommunityReactionCount } from "@/services/community/community"

export function CommunityReactionRow({
  reactions,
  myReaction,
  onToggle,
  disabled,
  inline = false,
}: {
  reactions: CommunityReactionCount[]
  myReaction: [] | [bigint]
  onToggle: (code: ReactionCode) => void
  disabled?: boolean
  inline?: boolean
}) {
  if (!reactions?.length) return null

  const mine = myReactionCode({ myReaction })

  return (
    <div
      className={cn(
        "flex flex-wrap gap-0.5",
        inline
          ? "rounded-full bg-muted/45 px-1 py-0.5"
          : "mt-1"
      )}
    >
      {reactions.map((row) => {
        const code = Number(row.code) as ReactionCode
        const active = mine === code
        return (
          <button
            key={`${code}-${row.count.toString()}`}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(code)}
            className={cn(
              "inline-flex min-h-5 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium transition-colors animate-in fade-in zoom-in-95 duration-200",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/70"
            )}
          >
            <CommunityReactionIcon code={code} size={18} />
            <span>{row.count.toString()}</span>
          </button>
        )
      })}
    </div>
  )
}
