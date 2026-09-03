const ICRC_API_BASE = "https://icrc-api.internetcomputer.org/api/v2"
export const ICRC_MAX_PAGES = 10
const ICRC_FETCH_TIMEOUT_MS = 15_000

export function isIcrcFetchAbort(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { name?: string; digest?: string; message?: string }
  return (
    e.name === "AbortError" ||
    e.digest === "HANGING_PROMISE_REJECTION" ||
    (typeof e.message === "string" && e.message.includes("During prerendering"))
  )
}

async function fetchIcrc(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(ICRC_FETCH_TIMEOUT_MS) })
}

export function shouldContinueIcrcPages(
  pageCount: number,
  tokenCount: number,
  limit: number,
  nextCursor: string | null | undefined,
): boolean {
  return (
    pageCount < ICRC_MAX_PAGES &&
    tokenCount < limit &&
    Boolean(nextCursor)
  )
}

export type IcrcTokenValue = {
  price: number
  price_usd: number
  price_change_24h: number
  price_change_24h_usd: number
  volume_24h: number
  volume_24h_usd: number
  volume_7d: number
  volume_7d_usd: number
  fdv: number
  fdv_usd: number
  fdv_change_24h?: number
  fdv_change_24h_usd?: number
  source?: string
  source_url?: string
  timestamp?: number
}

export type IcrcApiToken = {
  ledger_canister_id: string
  network: string
  token_type: string
  token_value?: IcrcTokenValue | null
  icrc1_metadata: {
    icrc1_name: string
    icrc1_symbol: string
    icrc1_decimals: string
    icrc1_fee: string
    icrc1_logo: string | null
    icrc1_total_supply: string
  }
  urls?: {
    website?: string[]
    twitter?: string[]
    explorer?: string[]
    source_code?: string[]
    chat?: string[]
    announcement?: string[]
  } | null
  unique_owners_count?: number
  unique_owners_count_change_24h?: number
  total_transactions_count_over_past_7d?: number
  total_volume_over_past_7d?: string
  circulating_supply?: string
  max_supply?: string
}

export type IcrcApiResponse = {
  data: IcrcApiToken[]
  next_cursor: string | null
  previous_cursor: string | null
}

export type IcrcTokenValuePoint = {
  timestamp: number
  price_usd: number
  volume_24h_usd: number
}

export function icrcPercentChange24h(value: IcrcTokenValue | null | undefined): number {
  if (!value?.price_usd) return 0
  const previous = value.price_usd - (value.price_change_24h_usd ?? 0)
  if (previous === 0) return 0
  return ((value.price_change_24h_usd ?? 0) / previous) * 100
}

export type FetchIcrcTokensOpts = {
  limit?: number
  sortBy?: string
  hasTransactions?: boolean
}

export async function fetchIcrcTokens(opts: FetchIcrcTokensOpts | number = 500): Promise<IcrcApiToken[]> {
  const options: FetchIcrcTokensOpts = typeof opts === "number" ? { limit: opts } : opts
  const limit = options.limit ?? 500
  const allTokens: IcrcApiToken[] = []
  let cursor: string | null = null

  try {
    let pageCount = 0
    while (allTokens.length < limit && pageCount < ICRC_MAX_PAGES) {
      pageCount++
      const params = new URLSearchParams({
        limit: "100",
        network: "mainnet",
        has_transactions: String(options.hasTransactions ?? true),
      })
      if (options.sortBy) params.set("sort_by", options.sortBy)
      if (cursor) params.set("after", cursor)

      const res = await fetchIcrc(`${ICRC_API_BASE}/ledgers?${params}`)
      if (!res.ok) break

      const body: IcrcApiResponse = await res.json()
      if (!body.data || body.data.length === 0) break

      allTokens.push(...body.data.filter((t) => t.network === "mainnet"))
      if (!shouldContinueIcrcPages(pageCount, allTokens.length, limit, body.next_cursor)) break
      if (body.next_cursor === cursor) break
      cursor = body.next_cursor
    }

    return allTokens.slice(0, limit)
  } catch (err) {
    if (!isIcrcFetchAbort(err)) console.error("[icrcApi] Failed to fetch tokens:", err)
    return []
  }
}

export async function fetchIcrcTokenDetail(ledgerId: string): Promise<IcrcApiToken | null> {
  try {
    const res = await fetchIcrc(`${ICRC_API_BASE}/ledgers/${ledgerId}`)
    if (!res.ok) return null
    const body = await res.json()
    return (body.data ?? body) as IcrcApiToken
  } catch (err) {
    if (!isIcrcFetchAbort(err)) console.error("[icrcApi] Failed to fetch token detail:", err)
    return null
  }
}

export async function fetchIcrcTokenValues(
  ledgerId: string,
  start: number,
  end: number,
  limit = 200
): Promise<IcrcTokenValuePoint[]> {
  try {
    const params = new URLSearchParams({
      start: String(start),
      end: String(end),
      limit: String(limit),
    })
    const res = await fetchIcrc(`${ICRC_API_BASE}/ledgers/${ledgerId}/token-values?${params}`)
    if (!res.ok) return []
    const body = await res.json()
    const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
    return rows
      .map((row: Record<string, unknown>) => ({
        timestamp: Number(row.timestamp ?? 0),
        price_usd: Number(row.price_usd ?? row.price ?? 0),
        volume_24h_usd: Number(row.volume_24h_usd ?? row.volume_24h ?? 0),
      }))
      .filter((row: IcrcTokenValuePoint) => row.timestamp > 0 && Number.isFinite(row.price_usd))
  } catch {
    return []
  }
}

export async function fetchIcrcLedgersCount(): Promise<number> {
  try {
    const res = await fetchIcrc(
      `${ICRC_API_BASE}/ledgers/count?has_transactions=true&network=mainnet`
    )
    if (!res.ok) return 0
    const body = await res.json()
    return Number(body?.total ?? body?.count ?? body?.data?.total ?? 0) || 0
  } catch {
    return 0
  }
}
