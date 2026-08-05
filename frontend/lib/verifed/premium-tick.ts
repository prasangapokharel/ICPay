import { USERNAME_FREE_MIN_LENGTH, type Tier } from "@/lib/username"

// Gold is the top 2 lengths rather than the whole ultra-premium tier: 1- and
// 2-character handles are the scarcest inventory the sale will ever hold -- 36
// and ~1,300 of them against ~47,000 three-character names -- so a mark that
// covered all of ultra would say almost nothing.
const GOLD_MAX_LENGTH = 2

export type BadgeTier = "gold" | "blue"

// The badge means "this handle was paid for", so the blue floor is derived from
// the threshold that decides what the free claim may take rather than restated
// as a length range. The `>= 3 && <= 4` range this replaced withheld the badge
// from 1- and 2-character handles, which priceFor bills at the ultra-premium
// rate -- the rarest and most expensive names the sale issues.
//
// Accepts the "@name" display form as well as a bare handle: transaction
// counterparties are stored with the prefix and profile pages are not.
export function premiumTier(name: string | null | undefined): BadgeTier | null {
  if (!name) return null
  const len = (name.startsWith("@") ? name.slice(1) : name).length
  if (len === 0 || len >= USERNAME_FREE_MIN_LENGTH) return null
  return len <= GOLD_MAX_LENGTH ? "gold" : "blue"
}

export function isPremiumHandle(name: string | null | undefined): boolean {
  return premiumTier(name) !== null
}

// Which lengths each mark covers, derived from the same two thresholds rather
// than restated, so the pricing table cannot advertise a range the badge rule
// does not honour.
export const BADGE_RANGES: Record<BadgeTier, { min: number; max: number }> = {
  gold: { min: 1, max: GOLD_MAX_LENGTH },
  blue: { min: GOLD_MAX_LENGTH + 1, max: USERNAME_FREE_MIN_LENGTH - 1 },
}

export type BadgeSpan = { badge: BadgeTier; min: number; max: number }

// The badges a pricing tier reaches, each narrowed to the part of the tier it
// actually covers. Ultra spans both marks -- 1-2 gold, 3 blue -- so a single
// mark on that row would promise gold to a three-character buyer, and two bare
// marks read as though the row grants both. The narrowed span is what lets the
// row say which is which.
export function tierBadgeSpans(tier: Tier): BadgeSpan[] {
  const spans: BadgeSpan[] = []
  for (const badge of ["gold", "blue"] as const) {
    const min = Math.max(tier.minLength, BADGE_RANGES[badge].min)
    const max = Math.min(tier.maxLength, BADGE_RANGES[badge].max)
    if (min <= max) spans.push({ badge, min, max })
  }
  return spans
}
