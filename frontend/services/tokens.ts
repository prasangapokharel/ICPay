import { Actor, type Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@/services/icp"

// Mirrors backend Config.ICP_LEDGER_CANISTER_ID. ICP is listed first so it
// always heads the holdings list regardless of what discovery returns.
export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"

// The NNS SNS-W canister, which knows every SNS ever deployed.
const SNS_WASM_ID = "qaa6y-5yaaa-aaaaa-aaafa-cai"

// The chain-key tokens are not SNS-launched, so SNS-W does not list them and
// they have to be named explicitly.
const CK_LEDGER_IDS = [
  ICP_LEDGER_ID,
  "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
  "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
  "xevnm-gaaaa-aaaar-qafnq-cai", // ckUSDC
  "cngnf-vqaaa-aaaar-qag4q-cai", // ckUSDT
]

// Only the two ICRC-1 methods this app calls. A trimmed interface keeps the
// candid decode cheap: the full ledger interface would pull in transfer and
// archive types that are never used here.
const balanceIdl = ({ IDL }: { IDL: any }) =>
  IDL.Service({
    icrc1_balance_of: IDL.Func(
      [IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)) })],
      [IDL.Nat],
      ["query"]
    ),
  })

const metadataIdl = ({ IDL }: { IDL: any }) => {
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

const snsWasmIdl = ({ IDL }: { IDL: any }) => {
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

/**
 * Length-prefixed, right-aligned principal in 32 bytes. Must stay byte-identical
 * to backend Subaccount.fromPrincipal -- this is what makes the custodial
 * address the frontend queries the same one the canister deposits into.
 */
export function custodialSubaccount(user: Principal): Uint8Array {
  const bytes = user.toUint8Array()
  const out = new Uint8Array(32)
  const padding = 32 - bytes.length - 1
  out[padding] = bytes.length
  out.set(bytes, padding + 1)
  return out
}

/**
 * Every ICRC-1 ledger worth scanning. Discovery is one query call to SNS-W
 * rather than the SNS aggregator's REST API, which inlines base64 logos and
 * costs 5.4MB across six requests to return the same canister ids.
 */
export async function listLedgerIds(identity?: Identity): Promise<string[]> {
  const agent = await createAgent(identity)
  const snsw = Actor.createActor<{
    list_deployed_snses: (a: Record<string, never>) => Promise<{
      instances: { ledger_canister_id: [] | [Principal] }[]
    }>
  }>(snsWasmIdl, { agent, canisterId: SNS_WASM_ID })

  let sns: string[] = []
  try {
    const { instances } = await snsw.list_deployed_snses({})
    sns = instances.flatMap((i) => (i.ledger_canister_id[0] ? [i.ledger_canister_id[0].toText()] : []))
  } catch {
    // Discovery is an enhancement, not a requirement: if SNS-W is unreachable
    // the ck tokens below still resolve and the wallet stays usable.
  }

  const seen = new Set(CK_LEDGER_IDS)
  return [...CK_LEDGER_IDS, ...sns.filter((id) => !seen.has(id) && seen.add(id))]
}

/**
 * Balance for one account across many ledgers, in parallel.
 *
 * Only the balance is read here, never metadata: a symbol and logo cost a
 * second call per ledger and are worthless for the ~50 tokens the user holds
 * none of. Dead SNS ledgers reject the call, so a failure maps to zero and
 * drops out rather than failing the whole sweep.
 */
export async function fetchBalances(
  ledgerIds: string[],
  owner: Principal,
  subaccount: Uint8Array,
  identity?: Identity
): Promise<Map<string, bigint>> {
  const agent = await createAgent(identity)
  const account = { owner, subaccount: [Array.from(subaccount)] as [number[]] }

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

  return new Map(entries.filter(([, balance]) => balance > 0n))
}

/**
 * Symbol, decimals, fee and logo for a single ledger. Called only for tokens
 * the user actually holds, so the cost scales with the holdings list rather
 * than with the number of tokens that exist.
 *
 * The logo comes from the ledger's own icrc1:logo entry, a small inline SVG
 * data URI -- no image host to depend on and nothing extra to fetch.
 */
export async function fetchTokenMetadata(
  ledgerId: string,
  identity?: Identity
): Promise<Omit<TokenHolding, "balance"> | null> {
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
