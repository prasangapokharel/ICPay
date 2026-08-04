export type FiatRates = {
  date: string
  base: string
  rates: Record<string, number>
}

const FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rates"

// ICP is quoted in USD by CoinGecko; every other currency is derived in one
// Frankfurter call with USD as the base. This keeps the two external fetches
// fixed -- one crypto quote, one fiat table -- no matter how many currencies
// the UI asks for.
export async function fetchFiatRates(
  quotes: string[]
): Promise<FiatRates | null> {
  if (quotes.length === 0) return null
  const url = `${FRANKFURTER_URL}?base=USD&quotes=${quotes.join(",")}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(String(res.status))
  const rows: { date: string; base: string; quote: string; rate: number }[] =
    await res.json()
  if (!Array.isArray(rows) || rows.length === 0) return null
  return {
    date: rows[0].date,
    base: rows[0].base,
    rates: Object.fromEntries(rows.map((r) => [r.quote, r.rate])),
  }
}

// One call for the whole chain: ICP price in USD plus every fiat conversion.
export async function icpToFiat(
  icpAmount: number,
  icpUsd: number,
  quotes: string[]
): Promise<{ usd: number; fiat: Record<string, number> } | null> {
  const usd = icpAmount * icpUsd
  const rates = await fetchFiatRates(quotes)
  if (!rates) return { usd, fiat: {} }
  return {
    usd,
    fiat: Object.fromEntries(
      Object.entries(rates.rates).map(([code, rate]) => [code, usd * rate])
    ),
  }
}
