import { premiumTier } from "@/lib/verified/premiumTick"
import { RESERVED_BRANDS } from "@/lib/profile/reservedBrands"

// Higher score = safer recipient. 0–100, clamped.
// Each signal contributes up to its stated max. Missing data (profile not yet
// loaded, ledger not queried) contributes 0 rather than penalising the sender
// while data is in flight.

export type RiskLevel = "low" | "medium" | "high"

export type RiskScore = {
  score: number
  level: RiskLevel
  // Ordered list of what the score is built from, shown to the user.
  reasons: string[]
}

const NS_PER_MS = 1_000_000n
const DAY_MS = 86_400_000

function levBound(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let cur = i
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1] ? prev[j - 1] : Math.min(prev[j], cur, prev[j - 1]) + 1
      prev[j - 1] = cur
      cur = val
    }
    prev[b.length] = cur
  }
  return prev[b.length]
}

function isBrandSimilar(name: string): boolean {
  const n = name.toLowerCase()
  return RESERVED_BRANDS.some((brand) => brand !== n && levBound(n, brand, 1) <= 1)
}

export function computeRiskScore(params: {
  username: string | null
  createdAtNs: bigint | null  // from UserPublic.createdAt
  txCount: number | null      // from NNS index, null = not loaded yet
  reasonKeys: {
    hasUsername: string
    badgePremium: string
    badgeUltra: string
    accountAge: string
    hasTx: string
    brandSimilar: string
  }
}): RiskScore {
  const { username, createdAtNs, txCount, reasonKeys } = params
  let score = 0
  const reasons: string[] = []

  // 1. Has a username on ICPay — 20 pts
  if (username) {
    score += 20
    reasons.push(reasonKeys.hasUsername)

    // 2. Badge tier — gold (ultra/premium) 30 pts, blue (standard/basic) 20 pts
    const tier = premiumTier(username)
    if (tier === "gold") {
      score += 30
      reasons.push(reasonKeys.badgeUltra)
    } else if (tier === "blue") {
      score += 20
      reasons.push(reasonKeys.badgePremium)
    }
  }

  // 3. Account age — up to 20 pts
  if (createdAtNs !== null) {
    const days = Math.floor((Date.now() - Number(createdAtNs / NS_PER_MS)) / DAY_MS)
    const agePts = days >= 90 ? 20 : days >= 30 ? 14 : days >= 7 ? 8 : 0
    score += agePts
    if (agePts > 0) reasons.push(reasonKeys.accountAge)
  }

  // 4. Has on-chain transactions — up to 30 pts
  if (txCount !== null && txCount > 0) {
    const txPts = txCount >= 10 ? 30 : txCount >= 5 ? 20 : txCount >= 1 ? 10 : 0
    score += txPts
    if (txPts > 0) reasons.push(reasonKeys.hasTx)
  }

  // Penalty: brand-similar name caps score at 25
  if (username && isBrandSimilar(username)) {
    score = Math.min(score, 25)
    reasons.unshift(reasonKeys.brandSimilar)
  }

  score = Math.max(0, Math.min(100, score))

  const level: RiskLevel = score >= 70 ? "low" : score >= 40 ? "medium" : "high"

  return { score, level, reasons }
}
