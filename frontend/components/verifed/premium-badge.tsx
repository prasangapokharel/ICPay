import { HugeiconsIcon } from "@hugeicons/react"
import { BadgeCheckIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import { premiumTier, type BadgeTier } from "@/lib/verifed/premium-tick"
import { cn } from "@/lib/utils"

// Amber, not yellow: yellow-400 on the light theme's near-white surfaces is
// close to unreadable, and this mark has to hold up on a profile header and on
// the payment card's dark gradient alike.
const TONE: Record<BadgeTier, string> = {
  gold: "text-amber-400",
  blue: "text-blue-500",
}

// One component so the two tiers cannot drift apart across the places a handle
// is rendered. Takes the name rather than a boolean: the tier is derived from
// the handle's length, and a caller that decided for itself would be the drift
// this exists to prevent.
export function PremiumBadge({
  name,
  className,
}: {
  name: string | null | undefined
  className?: string
}) {
  return <BadgeMark tier={premiumTier(name)} className={className} />
}

// The mark without the derivation, for the pricing table, which marks a whole
// row and so has a tier but no name to ask about.
export function BadgeMark({
  tier,
  className,
}: {
  tier: BadgeTier | null
  className?: string
}) {
  const t = useTranslations("profileView")
  if (!tier) return null

  return (
    <HugeiconsIcon
      icon={BadgeCheckIcon}
      className={cn("size-4 shrink-0", TONE[tier], className)}
      aria-label={t(tier === "gold" ? "premiumGold" : "premium")}
    />
  )
}
