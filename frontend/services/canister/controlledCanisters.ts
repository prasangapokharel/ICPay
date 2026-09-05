import {
  fetchSubnetMetaMap,
  formatSubnetCountries,
  shortSubnetId,
} from "@/services/canister/subnetLocations"

const IC_API = "https://ic-api.internetcomputer.org/api/v3"
const PAGE = 50
const MAX_PAGES = 3

export type CanisterUpgrade = {
  proposalId: string
  moduleHash: string
  atLabel: string
}

export type ControlledCanister = {
  canisterId: string
  name: string
  subnetId: string
  moduleHash: string
  canisterType: string
  language: string
  updatedAt: string
  controllers: string[]
  countries: string[]
  nodeCount: number
  upgrades: CanisterUpgrade[]
}

export type SubnetIndexDetail = {
  subnetId: string
  subnetType: string
  totalNodes: number
  upNodes: number
  runningCanisters: number
  stoppedCanisters: number
}

type ApiUpgrade = {
  proposal_id?: number | string | null
  module_hash?: string | null
  executed_timestamp_seconds?: number | null
}

type ApiRow = {
  canister_id?: string
  name?: string | null
  subnet_id?: string | null
  module_hash?: string | null
  canister_type?: string | null
  language?: string | null
  updated_at?: string | null
  controllers?: unknown
  upgrades?: ApiUpgrade[] | null
}

export function normalizeControllers(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push(item.trim())
      continue
    }
    if (Array.isArray(item) && typeof item[0] === "string" && item[0].trim()) {
      out.push(item[0].trim())
    }
  }
  return out
}

function formatUpgradeAt(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—"
  return new Date(seconds * 1000).toLocaleString()
}

function mapUpgrades(raw: ApiUpgrade[] | null | undefined): CanisterUpgrade[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 8).map((u) => ({
    proposalId: u.proposal_id != null ? String(u.proposal_id) : "—",
    moduleHash: typeof u.module_hash === "string" ? u.module_hash : "",
    atLabel: formatUpgradeAt(u.executed_timestamp_seconds ?? null),
  }))
}

export function mapApiCanister(
  row: ApiRow,
  subnetMeta: Record<string, { countries: string[]; nodeCount: number }>
): ControlledCanister | null {
  const canisterId = typeof row.canister_id === "string" ? row.canister_id.trim() : ""
  if (!canisterId) return null
  const subnetId = typeof row.subnet_id === "string" ? row.subnet_id : ""
  const meta = subnetId ? subnetMeta[subnetId] : undefined
  return {
    canisterId,
    name: typeof row.name === "string" ? row.name.trim() : "",
    subnetId,
    moduleHash: typeof row.module_hash === "string" ? row.module_hash : "",
    canisterType: typeof row.canister_type === "string" ? row.canister_type : "",
    language: typeof row.language === "string" ? row.language.trim() : "",
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : "",
    controllers: normalizeControllers(row.controllers),
    countries: meta?.countries ?? [],
    nodeCount: meta?.nodeCount ?? 0,
    upgrades: mapUpgrades(row.upgrades),
  }
}

export function subnetLabel(
  meta: Pick<ControlledCanister, "subnetId" | "countries" | "nodeCount">
): string {
  if (!meta.subnetId) return ""
  const places = formatSubnetCountries(meta.countries, 4)
  const nodes = meta.nodeCount > 0 ? `${meta.nodeCount} nodes` : ""
  const short = shortSubnetId(meta.subnetId)
  return [places || short, nodes].filter(Boolean).join(" · ")
}

export async function fetchControlledCanisters(controllerId: string): Promise<{
  items: ControlledCanister[]
  total: number
}> {
  const principal = controllerId.trim()
  if (!principal) return { items: [], total: 0 }

  const rows: ApiRow[] = []
  let total = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE
    const url = `${IC_API}/canisters?controller_id=${encodeURIComponent(principal)}&limit=${PAGE}&offset=${offset}`
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) throw new Error(`IC index returned ${res.status}`)
    const body = (await res.json()) as {
      data?: ApiRow[]
      total_canisters?: number
    }
    const batch = body.data ?? []
    total = typeof body.total_canisters === "number" ? body.total_canisters : batch.length
    rows.push(...batch)
    if (batch.length < PAGE || rows.length >= total) break
  }

  const subnetMeta = await fetchSubnetMetaMap()
  const items: ControlledCanister[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const mapped = mapApiCanister(row, subnetMeta)
    if (!mapped || seen.has(mapped.canisterId)) continue
    seen.add(mapped.canisterId)
    items.push(mapped)
  }

  return { items, total }
}

export async function fetchCanisterIndexMeta(
  canisterId: string
): Promise<ControlledCanister | null> {
  const id = canisterId.trim()
  if (!id) return null
  try {
    const res = await fetch(`${IC_API}/canisters/${encodeURIComponent(id)}`, {
      method: "GET",
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    const row = (await res.json()) as ApiRow
    const subnetMeta = await fetchSubnetMetaMap()
    return mapApiCanister(row, subnetMeta)
  } catch {
    return null
  }
}

export async function fetchSubnetIndexDetail(
  subnetId: string
): Promise<SubnetIndexDetail | null> {
  const id = subnetId.trim()
  if (!id) return null
  try {
    const res = await fetch(`${IC_API}/subnets/${encodeURIComponent(id)}`, {
      method: "GET",
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    const body = (await res.json()) as {
      subnet_id?: string
      subnet_type?: string | null
      total_nodes?: number | null
      up_nodes?: number | null
      running_canisters?: number | null
      stopped_canisters?: number | null
    }
    return {
      subnetId: body.subnet_id ?? id,
      subnetType: typeof body.subnet_type === "string" ? body.subnet_type : "",
      totalNodes: typeof body.total_nodes === "number" ? body.total_nodes : 0,
      upNodes: typeof body.up_nodes === "number" ? body.up_nodes : 0,
      runningCanisters:
        typeof body.running_canisters === "number" ? body.running_canisters : 0,
      stoppedCanisters:
        typeof body.stopped_canisters === "number" ? body.stopped_canisters : 0,
    }
  } catch {
    return null
  }
}
