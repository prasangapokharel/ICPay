import { useTranslations } from "next-intl"
import { premiumTier, type BadgeTier } from "@/lib/verified/premiumTick"
import { cn } from "@/lib/ui/utils"

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

  // Inline rather than a Hugeicon: the free set only ships the outline, and an
  // outlined tick disappears against the payment card at badge sizes. Same
  // geometry, filled, with the check knocked out in white.
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={t(tier === "gold" ? "premiumGold" : "premium")}
      className={cn("size-4 shrink-0", TONE[tier], className)}
    >
      <path
        fill="currentColor"
        d="M14.3942 3.00083L14.1481 2.79115C12.9103 1.73628 11.0897 1.73628 9.85189 2.79115L9.60584 3.00083C8.96518 3.54679 8.16862 3.87674 7.32956 3.9437L7.00731 3.96941C5.38613 4.09878 4.09878 5.38613 3.96941 7.00731L3.9437 7.32956C3.87674 8.16862 3.54679 8.96518 3.00083 9.60584L2.79115 9.85189C1.73628 11.0897 1.73628 12.9103 2.79115 14.1481L3.00083 14.3942C3.54679 15.0348 3.87674 15.8314 3.9437 16.6704L3.96941 16.9927C4.09878 18.6139 5.38613 19.9012 7.00731 20.0306L7.32956 20.0563C8.16862 20.1233 8.96518 20.4532 9.60584 20.9992L9.85188 21.2089C11.0897 22.2637 12.9103 22.2637 14.1481 21.2089L14.3942 20.9992C15.0348 20.4532 15.8314 20.1233 16.6704 20.0563L16.9927 20.0306C18.6139 19.9012 19.9012 18.6139 20.0306 16.9927L20.0563 16.6704C20.1233 15.8314 20.4532 15.0348 20.9992 14.3942L21.2089 14.1481C22.2637 12.9103 22.2637 11.0897 21.2089 9.85188L20.9992 9.60584C20.4532 8.96518 20.1233 8.16862 20.0563 7.32956L20.0306 7.00731C19.9012 5.38613 18.6139 4.09878 16.9927 3.96941L16.6704 3.9437C15.8314 3.87674 15.0348 3.54679 14.3942 3.00083Z"
      />
      <path
        d="M8.5 12.2L10.8 14.5L15.5 9.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
