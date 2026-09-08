import type {
  CommunityMessagePublic,
  CommunityReactionCount,
  CommunityReactionUpdate,
} from '@/services/community/community'

export const REACTIONS = [
  { code: 1, emoji: '❤️' },
  { code: 2, emoji: '🔥' },
  { code: 3, emoji: '🎉' },
  { code: 4, emoji: '😢' },
] as const

export type ReactionCode = (typeof REACTIONS)[number]['code']

export function myReactionCode(message: Pick<CommunityMessagePublic, 'myReaction'>): ReactionCode | null {
  const raw = message.myReaction[0]
  if (raw == null) return null
  const n = Number(raw)
  if (n >= 1 && n <= 4) return n as ReactionCode
  return null
}

function reactionMap(reactions: CommunityReactionCount[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const row of reactions) counts.set(Number(row.code), Number(row.count))
  return counts
}

function toReactionArray(counts: Map<number, number>): CommunityReactionCount[] {
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([code, count]) => ({ code: BigInt(code), count: BigInt(count) }))
}

export function applyReactionTap(
  message: Pick<CommunityMessagePublic, 'reactions' | 'myReaction'>,
  code: ReactionCode,
): Pick<CommunityMessagePublic, 'reactions' | 'myReaction'> {
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
  update: CommunityReactionUpdate,
): CommunityMessagePublic {
  return { ...message, reactions: update.reactions, myReaction: update.myReaction }
}

export function reactionEmoji(code: number): string {
  return REACTIONS.find((r) => r.code === code)?.emoji ?? '•'
}
