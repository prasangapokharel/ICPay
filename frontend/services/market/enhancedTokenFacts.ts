import type { Identity } from "@icp-sdk/core/agent"
import { fromNullable } from "@dfinity/utils"
import { mapTokenMetadata } from "@icp-sdk/canisters/ledger/icrc"
import { icrcLedger } from "@/services/ledger/icrc"
import { icrcIndex } from "@/services/ledger/icrcIndex"
import { rememberTokenLogo, usableTokenLogo } from "@/lib/market/tokenLogo"
import { NULL_MINTING_PRINCIPAL } from "@/services/icpay/icpay"

export type IcrcLedgerFacts = {
  ledgerId: string
  name: string
  symbol: string
  decimals: number
  fee: bigint
  totalSupply: bigint
  mintingAccount: string | null
  supportedStandards: string[]
  indexCanisterId: string | null
  logoUrl: string | null
}

export type EnhancedTokenFacts = {
  ledgerId: string
  name: string
  symbol: string
  decimals: number
  fee: bigint
  logoUrl: string | null
  totalSupply: bigint
  mintingAccount: string | null
  supplyFixed: boolean | null
  supportedStandards: string[]
  supportedStandardsWithUrls: { name: string; url: string }[]
  indexCanisterId: string | null
  indexStatus?: {
    numBlocksSynced: bigint
    lastSyncedBlock: bigint
  }
}

const FACTS_TTL_MS = 5 * 60_000
const factsCache = new Map<string, { at: number; facts: EnhancedTokenFacts }>()
const factsInFlight = new Map<string, Promise<EnhancedTokenFacts | null>>()

export async function fetchEnhancedTokenFacts(
  ledgerId: string,
  identity?: Identity
): Promise<EnhancedTokenFacts | null> {
  const hit = factsCache.get(ledgerId)
  if (hit && Date.now() - hit.at < FACTS_TTL_MS) return hit.facts

  const pending = factsInFlight.get(ledgerId)
  if (pending) return pending

  const work = loadEnhancedFacts(ledgerId, identity).finally(() => {
    factsInFlight.delete(ledgerId)
  })
  factsInFlight.set(ledgerId, work)
  return work
}

async function loadEnhancedFacts(
  ledgerId: string,
  identity?: Identity
): Promise<EnhancedTokenFacts | null> {
  const ledger = await icrcLedger(identity, ledgerId)

  const [meta, supply, minting, standards, indexId] = await Promise.all([
    ledger.metadata({ certified: false }).then(mapTokenMetadata).catch((err) => {
      console.error(`[enhancedTokenFacts] Failed to load metadata for ${ledgerId}:`, err)
      return null
    }),
    ledger.totalTokensSupply({ certified: false }).catch(() => 0n),
    ledger.getMintingAccount({ certified: false }).catch((): [] => []),
    ledger
      .icrc10SupportedStandards({ certified: false })
      .catch(() => [] as { name: string; url: string }[]),
    ledger
      .getIndexPrincipal({ certified: false })
      .then((p) => p.toText())
      .catch(() => null),
  ])

  if (!meta) return null

  const logoUrl = usableTokenLogo(meta.icon)
  const mint = fromNullable(minting)
  const mintingAccountText = mint?.owner.toText() ?? null
  const supplyFixed = mintingAccountText === NULL_MINTING_PRINCIPAL

  let indexStatus: EnhancedTokenFacts["indexStatus"]
  if (indexId) {
    try {
      const index = await icrcIndex(identity, indexId)
      const status = await index.status({ certified: false })
      indexStatus = {
        numBlocksSynced: status.num_blocks_synced,
        lastSyncedBlock: status.num_blocks_synced,
      }
    } catch {
      indexStatus = undefined
    }
  }

  const facts: EnhancedTokenFacts = {
    ledgerId,
    name: meta.name ?? "Unknown",
    symbol: meta.symbol ?? "???",
    decimals: meta.decimals ?? 8,
    fee: meta.fee ?? 0n,
    logoUrl,
    totalSupply: supply,
    mintingAccount: mintingAccountText,
    supplyFixed,
    supportedStandards: standards.map((s) => s.name),
    supportedStandardsWithUrls: standards,
    indexCanisterId: indexId,
    indexStatus,
  }

  if (logoUrl) rememberTokenLogo(ledgerId, logoUrl)
  factsCache.set(ledgerId, { at: Date.now(), facts })
  return facts
}

export async function fetchTokenBatch(
  ledgerIds: string[],
  identity?: Identity
): Promise<Map<string, EnhancedTokenFacts>> {
  const results = await Promise.allSettled(
    ledgerIds.map((id) => fetchEnhancedTokenFacts(id, identity))
  )

  const map = new Map<string, EnhancedTokenFacts>()
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      map.set(result.value.ledgerId, result.value)
    }
  }
  return map
}

export async function getToken24hActivity(
  ledgerId: string,
  identity?: Identity
): Promise<number> {
  const facts = await fetchEnhancedTokenFacts(ledgerId, identity)
  if (!facts?.indexCanisterId || !facts.indexStatus) return 0

  const blocksPerDay = 86400n
  const dayAgoBlock = facts.indexStatus.numBlocksSynced - blocksPerDay
  const recentBlocks = facts.indexStatus.numBlocksSynced - dayAgoBlock

  return Number(recentBlocks)
}

// Backward compatibility exports
export async function fetchIcrcLedgerFacts(
  ledgerId: string,
  identity?: Identity
): Promise<IcrcLedgerFacts | null> {
  const enhanced = await fetchEnhancedTokenFacts(ledgerId, identity)
  if (!enhanced) return null

  return {
    ledgerId: enhanced.ledgerId,
    name: enhanced.name,
    symbol: enhanced.symbol,
    decimals: enhanced.decimals,
    fee: enhanced.fee,
    logoUrl: enhanced.logoUrl,
    totalSupply: enhanced.totalSupply,
    mintingAccount: enhanced.mintingAccount,
    supportedStandards: enhanced.supportedStandards,
    indexCanisterId: enhanced.indexCanisterId,
  }
}

export function isSupplyFixed(mintingAccount: string | null): boolean | null {
  if (mintingAccount === null) return null
  return mintingAccount === NULL_MINTING_PRINCIPAL
}
