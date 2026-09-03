import { fetchIcrcTokens, type IcrcApiToken } from "./icrcApi"

export type TokenPrice = {
  priceUsd: number
  priceChange24h: number
  volume24h: number
  fdv: number
}

let tokenListCache: { data: Map<string, IcrcApiToken>; timestamp: number } | null = null
const CACHE_TTL = 60_000 // 1 minute

async function getTokenIndex(): Promise<Map<string, IcrcApiToken>> {
  if (tokenListCache && Date.now() - tokenListCache.timestamp < CACHE_TTL) {
    return tokenListCache.data
  }

  const tokens = await fetchIcrcTokens(500)
  const index = new Map<string, IcrcApiToken>()
  for (const token of tokens) {
    index.set(token.ledger_canister_id, token)
  }

  tokenListCache = { data: index, timestamp: Date.now() }
  return index
}

export async function fetchTokenPrices(
  ledgerIds: string[]
): Promise<Map<string, TokenPrice>> {
  const index = await getTokenIndex()
  const priceMap = new Map<string, TokenPrice>()

  for (const id of ledgerIds) {
    const token = index.get(id)
    if (token?.token_value) {
      priceMap.set(id, {
        priceUsd: token.token_value.price_usd,
        priceChange24h: token.token_value.price_change_24h_usd,
        volume24h: token.token_value.volume_24h_usd,
        fdv: token.token_value.fdv_usd,
      })
    }
  }

  return priceMap
}
