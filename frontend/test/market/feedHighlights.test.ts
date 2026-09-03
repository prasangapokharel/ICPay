import {
  buildGainersFeed,
  buildMarketFeedBundle,
  buildNewListingsFeed,
  buildTrendingFeed,
  enrichFeedRows,
} from "../../lib/market/feedHighlights"
import type { IcrcApiToken } from "../../services/market/icrcApi"
import type { SnsListItem } from "../../services/market/snsApi"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const tokens: IcrcApiToken[] = [
  {
    ledger_canister_id: "xevnm-gaaaa-aaaar-qafnq-cai",
    network: "mainnet",
    token_type: "chain_key",
    token_value: {
      price: 1,
      price_usd: 1,
      price_change_24h: 0,
      price_change_24h_usd: 0,
      volume_24h: 5000,
      volume_24h_usd: 5000,
      volume_7d: 10000,
      volume_7d_usd: 10000,
      fdv: 1,
      fdv_usd: 1,
    },
    icrc1_metadata: {
      icrc1_name: "ckUSDC",
      icrc1_symbol: "ckUSDC",
      icrc1_decimals: "6",
      icrc1_fee: "10000",
      icrc1_logo: "https://example.com/usdc.png",
      icrc1_total_supply: "1",
    },
  },
  {
    ledger_canister_id: "tyyy3-4aaaa-aaaaq-aab7a-cai",
    network: "mainnet",
    token_type: "sns",
    token_value: {
      price: 0.0125,
      price_usd: 0.0125,
      price_change_24h: 0.00125,
      price_change_24h_usd: 0.00125,
      volume_24h: 100,
      volume_24h_usd: 100,
      volume_7d: 200,
      volume_7d_usd: 200,
      fdv: 1,
      fdv_usd: 1,
    },
    icrc1_metadata: {
      icrc1_name: "GOLDAO",
      icrc1_symbol: "GOLDAO",
      icrc1_decimals: "8",
      icrc1_fee: "100000",
      icrc1_logo: null,
      icrc1_total_supply: "1",
    },
  },
]

const snses: SnsListItem[] = [
  {
    ledger_canister_id: "555lq-jaaaa-aaaap-quxha-cai",
    root_canister_id: "root",
    name: "Gold",
    logo: "https://example.com/gold.png",
    created_at: "2026-01-01T00:00:00Z",
    ledger_price_usd: 1.2,
    ledger_price_24h_usd: 0.1,
    icrc1_metadata: { icrc1_symbol: "GOLD", icrc1_name: "Gold" },
  },
]

const trending = buildTrendingFeed(tokens)
assert(trending[0]?.symbol === "ckUSDC", "trending by volume")

const gainers = buildGainersFeed(tokens)
assert(gainers[0]?.symbol === "GOLDAO", "gainer first")
assert(Math.abs((gainers[0]?.change24h ?? 0) - 11.11) < 0.2, "gainer pct")

const news = buildNewListingsFeed(snses)
assert(news[0]?.symbol === "GOLD", "sns new listing")
assert(news[0]?.logoUrl === "https://example.com/gold.png", "sns logo")

const bundle = buildMarketFeedBundle(tokens, snses)
assert(bundle.trending.length === 2, "bundle trending")
assert(bundle.newListings.length === 1, "bundle new")
assert(bundle.gainers.length === 1, "bundle gainers")

const enriched = enrichFeedRows(bundle.gainers, [
  {
    baseLedgerId: "tyyy3-4aaaa-aaaaq-aab7a-cai",
    stats: { priceUsd: 0.02, priceChange24h: 15 },
  },
])
assert(enriched[0]?.priceUsd === 0.0125, "keep feed price when present")

console.log("feedHighlights ok")
