const SNS_API_BASE = "https://sns-api.internetcomputer.org/api/v2"

export type SnsListItem = {
  ledger_canister_id: string
  root_canister_id: string
  name: string
  logo: string | null
  created_at: string | null
  ledger_price_usd: number | null
  ledger_price_24h_usd: number | null
  icrc1_metadata?: {
    icrc1_symbol?: string
    icrc1_name?: string
    icrc1_logo?: string | null
  } | null
}

let snsCache: { data: SnsListItem[]; expiresAt: number } | null = null

export async function fetchRecentSnses(limit = 20): Promise<SnsListItem[]> {
  if (snsCache && Date.now() < snsCache.expiresAt) {
    return snsCache.data.slice(0, limit)
  }
  try {
    const res = await fetch(`${SNS_API_BASE}/snses?limit=${Math.max(limit, 50)}`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return snsCache?.data.slice(0, limit) ?? []
    const body = await res.json()
    const rows = Array.isArray(body?.data) ? body.data : []
    const sorted = rows
      .filter((row: SnsListItem) => Boolean(row?.ledger_canister_id))
      .sort((a: SnsListItem, b: SnsListItem) => {
        const ta = a.created_at ? Date.parse(a.created_at) : 0
        const tb = b.created_at ? Date.parse(b.created_at) : 0
        return tb - ta
      })
    snsCache = { data: sorted, expiresAt: Date.now() + 60_000 }
    return sorted.slice(0, limit)
  } catch {
    return snsCache?.data.slice(0, limit) ?? []
  }
}
