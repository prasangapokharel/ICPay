import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { fetchEnhancedTokenFacts, type IcrcLedgerFacts } from "./icrcLedgerFacts"
import { fetchIcpswapTokenStats } from "./icpswapStats"
import type { TerminalPairRow } from "./tradePairSnapshot"

export type CustomTokenSearchResult = {
  found: true
  token: IcrcLedgerFacts
  stats: Awaited<ReturnType<typeof fetchIcpswapTokenStats>>
} | {
  found: false
  error: string
}

export async function searchTokenByCanister(
  canisterId: string,
  identity?: Identity
): Promise<CustomTokenSearchResult> {
  try {
    const principal = Principal.fromText(canisterId.trim())
    const ledgerId = principal.toText()

    const [facts, stats] = await Promise.all([
      fetchEnhancedTokenFacts(ledgerId, identity),
      fetchIcpswapTokenStats(ledgerId).catch(() => null),
    ])

    if (!facts) {
      return {
        found: false,
        error: "Not a valid ICRC token ledger"
      }
    }

    return {
      found: true,
      token: facts,
      stats,
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid principal")) {
      return {
        found: false,
        error: "Invalid canister ID format"
      }
    }
    return {
      found: false,
      error: "Failed to fetch token data"
    }
  }
}

export function customTokenToRow(
  facts: IcrcLedgerFacts,
  stats: Awaited<ReturnType<typeof fetchIcpswapTokenStats>>
): TerminalPairRow {
  return {
    baseLedgerId: facts.ledgerId,
    base: facts,
    stats,
    hasPool: (stats?.tvlUsd ?? 0) > 0 || (stats?.volume7dUsd ?? 0) > 0,
  }
}
