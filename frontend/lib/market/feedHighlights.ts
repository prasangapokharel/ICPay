import {
  icrcPercentChange24h,
  type IcrcApiToken,
} from "@/services/market/icrcApi"
import type { SnsListItem } from "@/services/market/snsApi"
import { usableTokenLogo } from "@/lib/market/tokenLogo"

export const ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai"

export type MarketFeedRow = {
  ledgerId: string
  symbol: string
  name: string
  logoUrl: string | null
  priceUsd: number | null
  change24h: number | null
  meta?: string
}

export type MarketFeedBundle = {
  trending: MarketFeedRow[]
  newListings: MarketFeedRow[]
  gainers: MarketFeedRow[]
}

function compactUsd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

function fromIcrc(token: IcrcApiToken, meta?: string): MarketFeedRow | null {
  const ledgerId = token.ledger_canister_id?.trim()
  const symbol = token.icrc1_metadata?.icrc1_symbol?.trim()
  if (!ledgerId || !symbol || ledgerId === ICP_LEDGER) return null
  const priceUsd = token.token_value?.price_usd ?? null
  const change24h = token.token_value ? icrcPercentChange24h(token.token_value) : null
  return {
    ledgerId,
    symbol,
    name: token.icrc1_metadata.icrc1_name?.trim() || symbol,
    logoUrl: usableTokenLogo(token.icrc1_metadata.icrc1_logo),
    priceUsd,
    change24h,
    meta,
  }
}

function fromSns(item: SnsListItem): MarketFeedRow | null {
  const ledgerId = item.ledger_canister_id?.trim()
  const symbol =
    item.icrc1_metadata?.icrc1_symbol?.trim() ||
    item.name?.trim()?.slice(0, 12) ||
    ""
  if (!ledgerId || !symbol || ledgerId === ICP_LEDGER) return null
  const prev = (item.ledger_price_usd ?? 0) - (item.ledger_price_24h_usd ?? 0)
  const change24h =
    item.ledger_price_usd != null && prev > 0
      ? ((item.ledger_price_24h_usd ?? 0) / prev) * 100
      : null
  return {
    ledgerId,
    symbol,
    name: item.icrc1_metadata?.icrc1_name?.trim() || item.name?.trim() || symbol,
    logoUrl: usableTokenLogo(item.icrc1_metadata?.icrc1_logo || item.logo),
    priceUsd: item.ledger_price_usd,
    change24h,
  }
}

export function buildTrendingFeed(tokens: IcrcApiToken[], limit = 3): MarketFeedRow[] {
  const sorted = [...tokens]
    .filter((t) => (t.token_value?.volume_24h_usd ?? 0) > 0)
    .sort((a, b) => (b.token_value?.volume_24h_usd ?? 0) - (a.token_value?.volume_24h_usd ?? 0))

  const out: MarketFeedRow[] = []
  const seen = new Set<string>()
  for (const token of sorted) {
    const vol = token.token_value?.volume_24h_usd ?? 0
    const row = fromIcrc(token, vol > 0 ? `$${compactUsd(vol)} vol` : undefined)
    if (!row || seen.has(row.ledgerId)) continue
    seen.add(row.ledgerId)
    out.push(row)
    if (out.length >= limit) break
  }
  return out
}

export function buildGainersFeed(tokens: IcrcApiToken[], limit = 3): MarketFeedRow[] {
  const sorted = [...tokens]
    .filter((t) => Boolean(t.token_value?.price_usd))
    .map((t) => ({ token: t, change: icrcPercentChange24h(t.token_value) }))
    .filter((item) => item.change > 0)
    .sort((a, b) => b.change - a.change)

  const out: MarketFeedRow[] = []
  const seen = new Set<string>()
  for (const item of sorted) {
    const row = fromIcrc(item.token)
    if (!row || seen.has(row.ledgerId)) continue
    seen.add(row.ledgerId)
    out.push(row)
    if (out.length >= limit) break
  }
  return out
}

export function buildNewListingsFeed(snses: SnsListItem[], limit = 3): MarketFeedRow[] {
  const out: MarketFeedRow[] = []
  const seen = new Set<string>()
  for (const item of snses) {
    const row = fromSns(item)
    if (!row || seen.has(row.ledgerId)) continue
    seen.add(row.ledgerId)
    out.push(row)
    if (out.length >= limit) break
  }
  return out
}

export function buildMarketFeedBundle(
  tokens: IcrcApiToken[],
  snses: SnsListItem[]
): MarketFeedBundle {
  return {
    trending: buildTrendingFeed(tokens),
    newListings: buildNewListingsFeed(snses),
    gainers: buildGainersFeed(tokens),
  }
}

export function enrichFeedRows(
  rows: MarketFeedRow[],
  listed: { baseLedgerId: string; stats?: { priceUsd: number; priceChange24h: number } | null }[]
): MarketFeedRow[] {
  return rows.map((row) => {
    const hit = listed.find((item) => item.baseLedgerId === row.ledgerId)
    if (!hit?.stats) return row
    return {
      ...row,
      priceUsd: row.priceUsd ?? hit.stats.priceUsd,
      change24h: row.change24h ?? hit.stats.priceChange24h,
    }
  })
}
