import { createAvatar } from "@dicebear/core"
import { identicon } from "@dicebear/collection"

const CHANNEL_SEED_PREFIX = "icpay:channel:"

const IDENTICON_ROW_COLORS = [
  "0ea5e9",
  "6366f1",
  "8b5cf6",
  "14b8a6",
  "22d3ee",
  "f97316",
] as const

export function communityAvatarSeed(slug: string): string {
  return `${CHANNEL_SEED_PREFIX}${slug.trim().toLowerCase()}`
}

export function communityAvatarUri(slug: string, pixels = 80): string {
  return createAvatar(identicon, {
    seed: communityAvatarSeed(slug),
    size: pixels,
    rowColor: [...IDENTICON_ROW_COLORS],
  }).toDataUri()
}
