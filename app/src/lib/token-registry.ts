import useSWR from "swr"

// The NNS dashboard's public token index. It returns metadata and a USD quote
// for every ledger on the IC in one request, which replaces one icrc1_metadata
// call per ledger and is the only source of a price for anything but ICP.
const REGISTRY_URL = "https://icrc-api.internetcomputer.org/api/v2/ledgers?limit=100"

export type TokenMarket = {
  ledgerId: string
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
  priceUsd?: number
}

type RegistryRow = {
  ledger_canister_id?: string
  token_value?: { price?: number | null } | null
  icrc1_metadata?: Record<string, string | null> | null
}

function toRow(r: RegistryRow): TokenMarket | null {
  const ledgerId = r.ledger_canister_id
  const md = r.icrc1_metadata
  const symbol = md?.icrc1_symbol
  if (!ledgerId || !symbol) return null

  const decimals = Number(md?.icrc1_decimals)
  const price = r.token_value?.price
  const logo = md?.icrc1_logo

  return {
    ledgerId,
    symbol,
    name: md?.icrc1_name || symbol,
    decimals: Number.isFinite(decimals) ? decimals : 8,
    fee: md?.icrc1_fee ? BigInt(md.icrc1_fee) : 0n,
    // Hosted URLs here, where the ledgers serve inline data URIs. Both render;
    // anything else is dropped rather than handed to next/image as a bad src.
    logo: logo?.startsWith("https://") || logo?.startsWith("data:") ? logo : undefined,
    priceUsd: typeof price === "number" ? price : undefined,
  }
}

export async function fetchTokenRegistry(): Promise<Map<string, TokenMarket>> {
  // Coalesces concurrent callers only, and is released as soon as the request
  // settles. The metadata path calls this once per held token in the same tick,
  // so without it twelve holdings mean twelve identical requests -- but holding
  // the result past that would freeze the price for the rest of the session,
  // which is what the SWR entry below is for.
  if (!inFlight) {
    inFlight = loadRegistry().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

let inFlight: Promise<Map<string, TokenMarket>> | null = null

async function loadRegistry(): Promise<Map<string, TokenMarket>> {
  const res = await fetch(REGISTRY_URL)
  if (!res.ok) throw new Error(String(res.status))
  const json: { data?: RegistryRow[] } = await res.json()
  const rows = (json.data ?? []).flatMap((r) => {
    const row = toRow(r)
    return row ? [[row.ledgerId, row] as const] : []
  })
  return new Map(rows)
}

const REGISTRY_KEY = "token-registry"

// Every consumer shares one entry and one request. Symbols and decimals never
// change and a stale price is decorative, so this is held for five minutes and
// never revalidated on focus -- the same treatment useIcpPrice gets.
export function useTokenRegistry(): Map<string, TokenMarket> | undefined {
  const { data } = useSWR(REGISTRY_KEY, fetchTokenRegistry, {
    dedupingInterval: 300_000,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })

  return data
}
