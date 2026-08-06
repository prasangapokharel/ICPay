import { Actor, type Identity } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"
import { query } from "@/services/client"
import { listTokens } from "@/services/launch/launch"
import { fetchTokenRegistry } from "@/lib/token-registry"

// Mirrors backend Config.ICP_LEDGER_CANISTER_ID.
export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"

// The NNS SNS-W canister, which knows every SNS ever deployed.
const SNS_WASM_ID = "qaa6y-5yaaa-aaaaa-aaafa-cai"

// The chain-key tokens are not SNS-launched, so SNS-W does not list them.
// Exported because these are also the rows the wallet shows unconditionally: a
// list that hides ckBTC until you hold some gives you nowhere to deposit it to.
export const PINNED_LEDGER_IDS = [
  ICP_LEDGER_ID,
  "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
  "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
  "xevnm-gaaaa-aaaar-qafnq-cai", // ckUSDC
  "cngnf-vqaaa-aaaar-qag4q-cai", // ckUSDT
]

// One page of launches is enough until ICPay has launched this many tokens;
// past that the wallet would need to page. Every id returned costs a balance
// call per wallet load, so this is a cost ceiling rather than a display limit.
const LAUNCHED_TOKEN_LIMIT = 50

// Trimmed to the methods this app calls: the full ledger interface would pull in
// transfer and archive types that are never used here.
const balanceIdl: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    icrc1_balance_of: IDL.Func(
      [IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)) })],
      [IDL.Nat],
      ["query"]
    ),
  })

const metadataIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Value = IDL.Rec()
  Value.fill(
    IDL.Variant({
      Int: IDL.Int,
      Nat: IDL.Nat,
      Blob: IDL.Vec(IDL.Nat8),
      Text: IDL.Text,
      Array: IDL.Vec(Value),
      Map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
    })
  )
  return IDL.Service({
    icrc1_metadata: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, Value))], ["query"]),
  })
}

const snsWasmIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const P = IDL.Principal
  const Sns = IDL.Record({
    root_canister_id: IDL.Opt(P),
    governance_canister_id: IDL.Opt(P),
    ledger_canister_id: IDL.Opt(P),
    swap_canister_id: IDL.Opt(P),
    index_canister_id: IDL.Opt(P),
  })
  return IDL.Service({
    list_deployed_snses: IDL.Func(
      [IDL.Record({})],
      [IDL.Record({ instances: IDL.Vec(Sns) })],
      ["query"]
    ),
  })
}

export type TokenHolding = {
  ledgerId: string
  balance: bigint
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
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

// Discovery is one query call to SNS-W rather than the SNS aggregator's REST
// API, which inlines base64 logos and costs 5.4MB across six requests to return
// the same canister ids.
//
// Tokens ICPay launched are not SNS-deployed, so SNS-W never lists them and the
// wallet would hide a token the user created here.
export async function listLedgerIds(identity?: Identity): Promise<string[]> {
  const agent = await createAgent(identity)
  const snsw = Actor.createActor<{
    list_deployed_snses: (a: Record<string, never>) => Promise<{
      instances: { ledger_canister_id: [] | [Principal] }[]
    }>
  }>(snsWasmIdl, { agent, canisterId: SNS_WASM_ID })

  const [sns, launched] = await Promise.all([
    snsw
      .list_deployed_snses({})
      .then(({ instances }) =>
        instances.flatMap((i) => (i.ledger_canister_id[0] ? [i.ledger_canister_id[0].toText()] : []))
      )
      // Discovery is an enhancement, not a requirement: if SNS-W is unreachable
      // the ck tokens below still resolve and the wallet stays usable.
      .catch((): string[] => []),
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
  const account = {
    owner,
    subaccount: (subaccount ? [Array.from(subaccount)] : []) as [] | [number[]],
  }

  const entries = await Promise.all(
    ledgerIds.map(async (ledgerId): Promise<[string, bigint]> => {
      try {
        const ledger = Actor.createActor<{
          icrc1_balance_of: (a: unknown) => Promise<bigint>
        }>(balanceIdl, { agent, canisterId: ledgerId })
        return [ledgerId, await ledger.icrc1_balance_of(account)]
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
  identity?: Identity
): Promise<Omit<TokenHolding, "balance"> | null> {
  try {
    const row = (await fetchTokenRegistry()).get(ledgerId)
    if (row) {
      const { symbol, name, decimals, fee, logo } = row
      return { ledgerId, symbol, name, decimals, fee, logo }
    }
  } catch {
    // Falls through to the ledger below.
  }

  const agent = await createAgent(identity)
  try {
    const ledger = Actor.createActor<{
      icrc1_metadata: () => Promise<[string, Record<string, unknown>][]>
    }>(metadataIdl, { agent, canisterId: ledgerId })

    const raw = await ledger.icrc1_metadata()
    const md = new Map(raw.map(([key, value]) => [key, Object.values(value)[0]]))
    const symbol = md.get("icrc1:symbol")
    if (typeof symbol !== "string") return null

    const decimals = md.get("icrc1:decimals")
    const fee = md.get("icrc1:fee")
    const logo = md.get("icrc1:logo")
    const name = md.get("icrc1:name")

    return {
      ledgerId,
      symbol,
      name: typeof name === "string" ? name : symbol,
      decimals: typeof decimals === "bigint" ? Number(decimals) : 8,
      fee: typeof fee === "bigint" ? fee : 0n,
      logo: typeof logo === "string" && logo.startsWith("data:") ? logo : undefined,
    }
  } catch {
    return null
  }
}
