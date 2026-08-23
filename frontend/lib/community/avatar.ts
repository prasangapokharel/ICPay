import { createAvatar } from "@dicebear/core"
import { identicon } from "@dicebear/collection"

export function communityAvatarUri(seed: string): string {
  return createAvatar(identicon, { seed }).toDataUri()
}
