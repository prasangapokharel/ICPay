import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"

// Seeded by username so the same person renders identically everywhere they
// appear -- search results, transfer preview, profile -- without needing their
// principal, which searchUsers does not return.
export function avatarUriFor(seed: string): string {
  return createAvatar(adventurer, { seed }).toDataUri()
}

export function shortPrincipal(text: string): string {
  return text.length > 12 ? `${text.slice(0, 6)}…${text.slice(-4)}` : text
}
