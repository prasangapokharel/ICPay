const QUOTE = "ICP"

export function pairSlug(symbol: string, quoteSymbol = QUOTE): string {
  const base = slugPart(symbol)
  const quote = slugPart(quoteSymbol)
  return `${base}_${quote}`
}

export function parsePairSlug(
  pair: string
): { base: string; quote: string } | null {
  const match = pair.trim().toUpperCase().match(/^([A-Z0-9]+)_([A-Z0-9]+)$/)
  if (!match?.[1] || !match[2]) return null
  return { base: match[1], quote: match[2] }
}

export function tradePairPath(symbol: string, quoteSymbol = QUOTE): string {
  return `/market/trade/${pairSlug(symbol, quoteSymbol)}`
}

export function tradePairHref(
  symbol: string,
  ledgerId: string,
  listed: { symbol: string; ledgerId: string }[],
  forceBase = false
): string {
  const path = tradePairPath(symbol)
  const slug = pairSlug(symbol)
  const clashes = listed.filter((row) => pairSlug(row.symbol) === slug)
  if (forceBase || clashes.length > 1) return `${path}?base=${encodeURIComponent(ledgerId)}`
  return path
}

export function ledgerForPairSlug(
  pair: string,
  listed: { symbol: string; ledgerId: string }[],
  preferredLedger?: string | null
): string | null {
  const parsed = parsePairSlug(pair)
  if (!parsed) return preferredLedger ?? null
  const hits = listed.filter((row) => pairSlug(row.symbol) === `${parsed.base}_${parsed.quote}`)
  if (preferredLedger && hits.some((row) => row.ledgerId === preferredLedger)) {
    return preferredLedger
  }
  return hits[0]?.ledgerId ?? preferredLedger ?? null
}

function slugPart(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  return cleaned || "TOKEN"
}
