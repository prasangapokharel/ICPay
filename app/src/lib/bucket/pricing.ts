import { CAPACITY_TIERS_GB } from "@/lib/bucket/bucket"

/** Mirrors backend BillingService.mo — keep constants in sync. */
const CYCLES_PER_GB_MONTH = 333_860_000_000n
const CYCLES_PER_ICP = 1_000_000_000_000n
const E8S_PER_ICP = 100_000_000n
const MARGIN_PERCENT = 50n
const HALF_ICP_E8S = 50_000_000n

export const BUCKET_POPULAR_TIER_GB = 5

export type BucketPricingTier = {
  gb: number
  priceE8s: bigint
  costE8s: bigint
  marginE8s: bigint
}

function roundToHalfIcp(e8s: bigint): bigint {
  return ((e8s + HALF_ICP_E8S - 1n) / HALF_ICP_E8S) * HALF_ICP_E8S
}

/** Cycle cost for 30 days — no margin. */
export function calculateCostE8s(capacityGB: number): bigint {
  const gb = BigInt(capacityGB)
  const cycles = gb * CYCLES_PER_GB_MONTH
  return (cycles * E8S_PER_ICP) / CYCLES_PER_ICP
}

/** Client estimate when the canister query is unavailable. */
export function calculatePriceE8s(capacityGB: number): bigint {
  const gb = BigInt(capacityGB)
  const cycles = gb * CYCLES_PER_GB_MONTH
  const withMargin = (cycles * (100n + MARGIN_PERCENT)) / 100n
  const preRound = (withMargin * E8S_PER_ICP) / CYCLES_PER_ICP
  return roundToHalfIcp(preRound)
}

export function buildPricingTier(gb: number, priceE8s: bigint): BucketPricingTier {
  const costE8s = calculateCostE8s(gb)
  return { gb, priceE8s, costE8s, marginE8s: priceE8s - costE8s }
}

export function buildEstimatedPricingTiers(): BucketPricingTier[] {
  return CAPACITY_TIERS_GB.map((gb) => buildPricingTier(gb, calculatePriceE8s(gb)))
}
