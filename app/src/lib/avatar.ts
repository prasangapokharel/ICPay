import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"

// Seeded so the same person renders identically everywhere they appear.
export function avatarUriFor(seed: string): string {
  return createAvatar(adventurer, { seed }).toDataUri()
}

export function avatarSvgFor(seed: string): string {
  return createAvatar(adventurer, { seed }).toString()
}

