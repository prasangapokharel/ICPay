import type {
  CommunityMessagePublic,
  CommunityReactionCount,
  CommunityReactionUpdate,
} from "@/services/community/community"

export const REACTION_GIF_PACK =
  "/images/community/4407-telegram-animated-emojis-pack-emojigg-pack"

export const REACTIONS = [
  { code: 1, id: "lv", emoji: "❤️", gif: "1690-love-face-emoji.gif" },
  { code: 2, id: "ht", emoji: "🔥", gif: "6686-hot-face-emoji.gif" },
  { code: 3, id: "hpy", emoji: "🎉", gif: "6685-star-struck-emoji.gif" },
  { code: 4, id: "sad", emoji: "😢", gif: "5218-cry-face-emoji.gif" },
] as const

export type ReactionCode = (typeof REACTIONS)[number]["code"]

export function myReactionCode(message: Pick<CommunityMessagePublic, "myReaction">): ReactionCode | null {
  const raw = message.myReaction[0]
  if (raw == null) return null
  const n = Number(raw)
  if (n >= 1 && n <= 4) return n as ReactionCode
  return null
}

function reactionMap(reactions: CommunityReactionCount[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const row of reactions) {
    counts.set(Number(row.code), Number(row.count))
  }
  return counts
}

function toReactionArray(counts: Map<number, number>): CommunityReactionCount[] {
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([code, count]) => ({ code: BigInt(code), count: BigInt(count) }))
}

export function applyReactionTap(
  message: Pick<CommunityMessagePublic, "reactions" | "myReaction">,
  code: ReactionCode
): Pick<CommunityMessagePublic, "reactions" | "myReaction"> {
  const mine = myReactionCode(message)
  const counts = reactionMap(message.reactions ?? [])

  const bump = (slot: number, delta: number) => {
    const next = Math.max(0, (counts.get(slot) ?? 0) + delta)
    if (next === 0) counts.delete(slot)
    else counts.set(slot, next)
  }

  if (mine === code) {
    bump(code, -1)
    return { reactions: toReactionArray(counts), myReaction: [] }
  }

  if (mine != null) bump(mine, -1)
  bump(code, 1)
  return { reactions: toReactionArray(counts), myReaction: [BigInt(code)] }
}

export function mergeReactionUpdate(
  message: CommunityMessagePublic,
  update: CommunityReactionUpdate
): CommunityMessagePublic {
  return {
    ...message,
    reactions: update.reactions,
    myReaction: update.myReaction,
  }
}

export function reactionEmoji(code: number): string {
  return REACTIONS.find((r) => r.code === code)?.emoji ?? "•"
}

export function reactionGifUrl(code: number): string {
  const reaction = REACTIONS.find((r) => r.code === code)
  if (!reaction) return ""
  return `${REACTION_GIF_PACK}/${reaction.gif}`
}
