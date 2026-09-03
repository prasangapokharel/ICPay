const AGGREGATOR = "https://3r4gx-wqaaa-aaaaq-aaaia-cai.raw.icp0.io/v1/sns/list/page"
const ROOT_LOGO = "https://3r4gx-wqaaa-aaaaq-aaaia-cai.raw.icp0.io/v1/sns/root"
const TTL_MS = 30 * 60_000

let cached: { at: number; map: Map<string, string> } | null = null
let inflight: Promise<Map<string, string>> | null = null

export async function fetchSnsLedgerLogos(): Promise<Map<string, string>> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.map
  if (inflight) return inflight
  inflight = loadSnsLogos().finally(() => {
    inflight = null
  })
  return inflight
}

async function loadSnsLogos(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const maxPages = 5
  const pages: unknown[][] = []

  for (let page = 0; page < maxPages; page++) {
    try {
      const res = await fetch(`${AGGREGATOR}/${page}/slow.json`)
      if (!res.ok) break
      const rows: unknown = await res.json()
      const pageRows = Array.isArray(rows) ? rows : []
      if (pageRows.length === 0) break
      pages.push(pageRows)
    } catch {
      break
    }
  }

  for (const rows of pages) {
    for (const row of rows) {
      const ids = (row as { canister_ids?: { ledger_canister_id?: string; root_canister_id?: string } })
        .canister_ids
      const ledger = ids?.ledger_canister_id
      const root = ids?.root_canister_id
      if (ledger && root) map.set(ledger, `${ROOT_LOGO}/${root}/logo.png`)
    }
  }
  cached = { at: Date.now(), map }
  return map
}
