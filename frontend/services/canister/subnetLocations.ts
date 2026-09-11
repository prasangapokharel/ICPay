export type SubnetOption = {
  id: string
  countries: string[]
  nodeCount: number
}

type IcApiNode = {
  subnet_id?: string | null
  region?: string | null
  node_type?: string | null
}

type SubnetAgg = {
  countries: Set<string>
  nodes: number
}

/** Parse IC dashboard region `"Continent,CC,Subdivision"` → country code. */
export function countryCodeFromRegion(region: string | null | undefined): string | null {
  if (!region) return null
  const parts = region.split(",").map((p) => p.trim())
  const code = parts[1]
  if (!code || code.length < 2 || code.length > 3) return null
  return code.toUpperCase()
}

/** Map IC region codes to lipis/flag-icons ISO filenames. */
export function flagCountryCode(code: string): string {
  const upper = code.toUpperCase()
  if (upper === "UK") return "gb"
  return upper.toLowerCase()
}

/**
 * Build subnet_id → countries + replica node count from the public IC nodes API.
 */
export async function fetchSubnetMetaMap(): Promise<Record<string, { countries: string[]; nodeCount: number }>> {
  try {
    const res = await fetch("https://ic-api.internetcomputer.org/api/v3/nodes?limit=5000", {
      method: "GET",
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return {}
    const data = (await res.json()) as { nodes?: IcApiNode[] }
    const bySubnet = new Map<string, SubnetAgg>()

    for (const node of data.nodes ?? []) {
      if (!node.subnet_id) continue
      if (node.node_type && node.node_type !== "REPLICA") continue
      let agg = bySubnet.get(node.subnet_id)
      if (!agg) {
        agg = { countries: new Set(), nodes: 0 }
        bySubnet.set(node.subnet_id, agg)
      }
      agg.nodes += 1
      const code = countryCodeFromRegion(node.region)
      if (code) agg.countries.add(code)
    }

    const out: Record<string, { countries: string[]; nodeCount: number }> = {}
    for (const [id, agg] of bySubnet) {
      out[id] = {
        countries: Array.from(agg.countries).sort((a, b) => a.localeCompare(b)),
        nodeCount: agg.nodes,
      }
    }
    return out
  } catch {
    return {}
  }
}

/** @deprecated use fetchSubnetMetaMap */
export async function fetchSubnetCountryMap(): Promise<Record<string, string[]>> {
  const meta = await fetchSubnetMetaMap()
  const out: Record<string, string[]> = {}
  for (const [id, value] of Object.entries(meta)) out[id] = value.countries
  return out
}

export function formatSubnetCountries(countries: string[], max = 8): string {
  if (countries.length === 0) return ""
  if (countries.length <= max) return countries.join(" · ")
  return `${countries.slice(0, max).join(" · ")} +${countries.length - max}`
}

export function shortSubnetId(id: string): string {
  if (id.length <= 18) return id
  return `${id.slice(0, 8)}…${id.slice(-6)}`
}
