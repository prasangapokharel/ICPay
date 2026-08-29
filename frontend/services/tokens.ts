import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister, mapTokenMetadata } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"
import { fetchSnsRegistryList } from "@/services/sns/registry"
import { query } from "@/services/client"
import { listTokens } from "@/services/launch/launch"
import { fetchTokenRegistry, type TokenMarket } from "@/lib/token/registry"

// Mirrors backend Config.ICP_LEDGER_CANISTER_ID.
export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"

// ICPay's own ICRC-1. Pinned so the wallet always shows a deposit row, same as ck*.
export const ICPAY_LEDGER_ID = "5fsnk-rqaaa-aaaan-q6m4q-cai"

// The chain-key tokens are not SNS-launched, so SNS-W does not list them.
// Exported because these are also the rows the wallet shows unconditionally: a
// list that hides ckBTC until you hold some gives you nowhere to deposit it to.
export const PINNED_LEDGER_IDS = [
  ICP_LEDGER_ID,
  ICPAY_LEDGER_ID,
  "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
  "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
  "xevnm-gaaaa-aaaar-qafnq-cai", // ckUSDC
  "cngnf-vqaaa-aaaar-qag4q-cai", // ckUSDT
]

// One page of launches is enough until ICPay has launched this many tokens;
// past that the wallet would need to page. Every id returned costs a balance
// call per wallet load, so this is a cost ceiling rather than a display limit.
const LAUNCHED_TOKEN_LIMIT = 50

export type TokenHolding = {
  ledgerId: string
  balance: bigint
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
}

export type TokenMetadata = Omit<TokenHolding, "balance">

export function metadataLedgerIds(balances: Map<string, bigint>): string[] {
  return [...balances.keys()].sort()
}

export function visibleMetadataLedgerIds(balances: Map<string, bigint>): string[] {
  return [...balances.entries()]
    .filter(([id, balance]) => balance > 0n || PINNED_LEDGER_IDS.includes(id))
    .map(([id]) => id)
    .sort()
}

export function metadataFromRegistry(
  ledgerId: string,
  registry: Map<string, TokenMarket>
): TokenMetadata | null {
  const row = registry.get(ledgerId)
  if (!row) return null
  const { symbol, name, decimals, fee, logo } = row
  return { ledgerId, symbol, name, decimals, fee, logo }
}

// Length-prefixed, right-aligned principal in 32 bytes. Must stay byte-identical
// to backend Subaccount.fromPrincipal -- this is what makes the address the
// frontend queries the same one the canister deposits into.
export function custodialSubaccount(user: Principal): Uint8Array {
  const bytes = user.toUint8Array()
  const out = new Uint8Array(32)
  const padding = 32 - bytes.length - 1
  out[padding] = bytes.length
  out.set(bytes, padding + 1)
  return out
}

// Whether the custodian will call this ledger at all. Asked before moving funds
// into custody, because a ledger it refuses would strand them there.
export function isLedgerSupported(
  identity: Identity | undefined,
  ledgerId: string
): Promise<boolean> {
  return query(identity, (actor) => actor.isLedgerSupported(ledgerId))
}

// The ledgers ICPay itself created. Split out because the wallet also checks
// these for funds sitting outside custody: a launch pays the whole supply to the
// creator's own principal, so a creator holds their token outside ICPay by
// default rather than by mistake.
export function listLaunchedLedgerIds(identity?: Identity): Promise<string[]> {
  return (
    listTokens(identity, LAUNCHED_TOKEN_LIMIT, 0)
      // ledgerId is a Candid opt, so the empty tuple is the launch that has no
      // canister yet and flattens away.
      .then((tokens) => tokens.flatMap((t) => t.ledgerId))
      .catch((): string[] => [])
  )
}

async function listSnsLedgerIds(identity?: Identity): Promise<string[]> {
  const rows = await fetchSnsRegistryList(identity)
  return rows.map((row) => row.ledgerId)
}

// Discovery is one query call to SNS-W rather than the SNS aggregator's REST
// API, which inlines base64 logos and costs 5.4MB across six requests to return
// the same canister ids.
//
// Tokens ICPay launched are not SNS-deployed, so SNS-W never lists them and the
// wallet would hide a token the user created here.
export async function listLedgerIds(identity?: Identity): Promise<string[]> {
  const [sns, launched] = await Promise.all([
    listSnsLedgerIds(identity),
    listLaunchedLedgerIds(identity),
  ])

  const seen = new Set(PINNED_LEDGER_IDS)
  return [
    ...PINNED_LEDGER_IDS,
    ...[...sns, ...launched].filter((id) => !seen.has(id) && seen.add(id)),
  ]
}

// Balance only, never metadata: a symbol and logo cost a second call per ledger
// and are worthless for the ~50 tokens the user holds none of. Dead SNS ledgers
// reject the call, so a failure maps to zero rather than failing the sweep.
// Zero balances are kept in the map, because the caller shows the pinned tokens
// whether or not they are held.
// An undefined subaccount reads the owner's own default account, which is where
// funds land when a sender drops the subaccount suffix from the deposit address.
export async function fetchBalances(
  ledgerIds: string[],
  owner: Principal,
  subaccount: Uint8Array | undefined,
  identity?: Identity
): Promise<Map<string, bigint>> {
  const agent = await createAgent(identity)

  const entries = await Promise.all(
    ledgerIds.map(async (ledgerId): Promise<[string, bigint]> => {
      try {
        const ledger = IcrcLedgerCanister.create({
          agent,
          canisterId: Principal.fromText(ledgerId),
        })
        const balance = await ledger.balance({
          owner,
          subaccount,
          certified: false,
        })
        return [ledgerId, balance]
      } catch {
        return [ledgerId, 0n]
      }
    })
  )

  return new Map(entries)
}

// Called only for tokens the user actually holds, so the cost scales with the
// holdings list rather than with the number of tokens that exist.
//
// The NNS token index answers for every ledger in one request, where the ledgers
// answer one at a time, so it is tried first. It is a third party: a miss or an
// outage falls through to icrc1_metadata rather than failing, because the ledger
// is the source of truth and is reachable whenever the wallet works at all.
export async function fetchTokenMetadata(
  ledgerId: string,
  identity?: Identity,
  registry?: Map<string, TokenMarket>
): Promise<TokenMetadata | null> {
  try {
    const reg = registry ?? (await fetchTokenRegistry())
    const fromRegistry = metadataFromRegistry(ledgerId, reg)
    if (fromRegistry) return fromRegistry
  } catch {
    // Falls through to the ledger below.
  }

  try {
    const agent = await createAgent(identity)
    const ledger = IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ledgerId),
    })
    const meta = mapTokenMetadata(await ledger.metadata({ certified: false }))
    if (!meta) return null

    return {
      ledgerId,
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
      fee: meta.fee,
      logo: meta.icon?.startsWith("data:") ? meta.icon : undefined,
    }
  } catch {
    return null
  }
}
