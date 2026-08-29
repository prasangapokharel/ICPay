import { createAvatar } from "@dicebear/core"
import { identicon } from "@dicebear/collection"
import { communityAvatarSeed } from "@/lib/community/avatar"

const IDENTICON_ROW_COLORS = [
  "0ea5e9",
  "6366f1",
  "8b5cf6",
  "14b8a6",
  "22d3ee",
  "f97316",
] as const

export function communityIdenticonSvg(slug: string, pixels = 512): string {
  return createAvatar(identicon, {
    seed: communityAvatarSeed(slug),
    size: pixels,
    rowColor: [...IDENTICON_ROW_COLORS],
  }).toString()
}
