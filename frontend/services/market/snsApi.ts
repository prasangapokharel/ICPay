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

export async function fetchRecentSnses(limit = 20): Promise<SnsListItem[]> {
  try {
    const res = await fetch(`${SNS_API_BASE}/snses?limit=${limit}`)
    if (!res.ok) return []
    const body = await res.json()
    const rows = Array.isArray(body?.data) ? body.data : []
    return rows
      .filter((row: SnsListItem) => Boolean(row?.ledger_canister_id))
      .sort((a: SnsListItem, b: SnsListItem) => {
        const ta = a.created_at ? Date.parse(a.created_at) : 0
        const tb = b.created_at ? Date.parse(b.created_at) : 0
        return tb - ta
      })
  } catch {
    return []
  }
}
