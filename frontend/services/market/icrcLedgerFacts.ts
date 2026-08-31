import type { Identity } from "@icp-sdk/core/agent"
import { fromNullable } from "@dfinity/utils"
import { mapTokenMetadata } from "@icp-sdk/canisters/ledger/icrc"
import { icrcLedger } from "@/services/ledger/icrc"

const ICRC_API = "https://icrc-api.internetcomputer.org/api/v1/ledgers"

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

type IcrcApiLedger = {
  ledger_canister_id: string
  icrc1_metadata?: {
    icrc1_name?: string
    icrc1_symbol?: string
    icrc1_decimals?: string
    icrc1_fee?: string
    icrc1_total_supply?: string
    icrc1_logo?: string | null
    icrc1_minting_account?: { owner: string } | null
  }
}

async function fetchIcrcApiLedger(ledgerId: string): Promise<IcrcApiLedger | null> {
  try {
    const res = await fetch(`${ICRC_API}/${ledgerId}`)
    if (!res.ok) return null
    const body = await res.json()
    return body as IcrcApiLedger
  } catch {
    return null
  }
}

export async function fetchIcrcLedgerFacts(
  ledgerId: string,
  identity?: Identity
): Promise<IcrcLedgerFacts | null> {
  const ledger = await icrcLedger(identity, ledgerId)

  const [meta, fee, totalSupply, minting, standards, indexPrincipal, apiRow] =
    await Promise.all([
      ledger.metadata({ certified: false }).then(mapTokenMetadata).catch(() => null),
      ledger.transactionFee({ certified: false }).catch(() => 0n),
      ledger.totalTokensSupply({ certified: false }).catch(() => 0n),
      ledger.getMintingAccount({ certified: false }).catch((): [] => []),
      ledger
        .icrc1SupportedStandards({ certified: false })
        .then((rows) => rows.map((r) => r.name))
        .catch(() => [] as string[]),
      ledger
        .getIndexPrincipal({ certified: false })
        .then((p) => p.toText())
        .catch(() => null),
      fetchIcrcApiLedger(ledgerId),
    ])

  const apiMeta = apiRow?.icrc1_metadata
  const mint = fromNullable(minting)
  const apiMint = apiMeta?.icrc1_minting_account?.owner ?? null

  if (!meta && !apiMeta) return null

  const decimals = meta?.decimals ?? Number(apiMeta?.icrc1_decimals ?? 8)
  const apiFee = apiMeta?.icrc1_fee ? BigInt(apiMeta.icrc1_fee) : fee
  const apiSupply = apiMeta?.icrc1_total_supply ? BigInt(apiMeta.icrc1_total_supply) : totalSupply

  return {
    ledgerId,
    name: meta?.name ?? apiMeta?.icrc1_name ?? "Unknown",
    symbol: meta?.symbol ?? apiMeta?.icrc1_symbol ?? "???",
    decimals,
    fee: meta?.fee ?? apiFee,
    totalSupply: apiSupply > 0n ? apiSupply : totalSupply,
    mintingAccount: mint?.owner.toText() ?? apiMint,
    supportedStandards: standards,
    indexCanisterId: indexPrincipal,
    logoUrl: meta?.icon?.startsWith("http")
      ? meta.icon
      : apiMeta?.icrc1_logo?.startsWith("http")
        ? apiMeta.icrc1_logo
        : null,
  }
}

import { NULL_MINTING_PRINCIPAL } from "@/services/icpay/icpay"

export function isSupplyFixed(mintingAccount: string | null): boolean | null {
  if (mintingAccount === null) return null
  return mintingAccount === NULL_MINTING_PRINCIPAL
}
