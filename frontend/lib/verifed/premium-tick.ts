import { USERNAME_FREE_MIN_LENGTH } from "@/lib/username"

// The verified badge means "this handle was paid for", so it is derived from the
// threshold that decides what the free claim may take rather than restated as a
// length range. The `>= 3 && <= 4` range this replaced withheld the badge from
// 1- and 2-character handles, which priceFor bills at the ultra-premium rate --
// the rarest and most expensive names the sale issues.
//
// Accepts the "@name" display form as well as a bare handle: transaction
// counterparties are stored with the prefix and profile pages are not.
export function isPremiumHandle(name: string | null | undefined): boolean {
  if (!name) return false
  const handle = name.startsWith("@") ? name.slice(1) : name
  return handle.length > 0 && handle.length < USERNAME_FREE_MIN_LENGTH
}
