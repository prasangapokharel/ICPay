import type { Metadata } from "next"
import type { IcpswapListedToken } from "@/services/market/icpswapStats"
import { isTerminalPairBase } from "@/lib/market/tradePairs"
import { ledgerForPairSlug, pairSlug, tradePairPath } from "@/lib/market/pairSlug"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function seoPriceLabel(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return ""
  if (usd >= 1000) return usd.toLocaleString("en-US", { maximumFractionDigits: 2 })
  if (usd >= 1) return usd.toLocaleString("en-US", { maximumFractionDigits: 4 })
  const raw = usd.toPrecision(4)
  return raw.replace(/\.?0+$/, "")
}

export function liveTradeTitle(opts: {
  symbol: string
  quoteSymbol: string
  name: string
  priceUsd?: number | null
}): string {
  const pair = `${opts.symbol}/${opts.quoteSymbol}`
  const price = opts.priceUsd != null ? seoPriceLabel(opts.priceUsd) : ""
  const lead = price ? `${price} Trade ${pair} Spot` : `Trade ${pair} Spot`
  return `${lead} | ${opts.name} Price · ICP SNS ICPSwap | ICPay`
}

export function tradePairDescription(opts: {
  symbol: string
  quoteSymbol: string
  name: string
  priceUsd?: number | null
}): string {
  const pair = `${opts.symbol}/${opts.quoteSymbol}`
  const price =
    opts.priceUsd != null && opts.priceUsd > 0
      ? ` Live USD price ${seoPriceLabel(opts.priceUsd)}.`
      : ""
  return `Trade ${pair} spot on ICPay. ${opts.name} versus ICP on ICPSwap — SNS and ICRC tokens on the Internet Computer.${price} Sign in with Internet Identity.`
}

export function resolveListedToken(
  pair: string,
  listed: IcpswapListedToken[],
  preferredLedger?: string | null
): IcpswapListedToken | null {
  const tradable = listed.filter((row) => isTerminalPairBase(row.ledgerId))
  const ledgerId = ledgerForPairSlug(
    pair,
    tradable.map((row) => ({ symbol: row.symbol, ledgerId: row.ledgerId })),
    preferredLedger
  )
  if (!ledgerId) return null
  return tradable.find((row) => row.ledgerId === ledgerId) ?? null
}

export function tradePairMetadata(token: IcpswapListedToken | null): Metadata {
  if (!token) {
    return {
      title: { absolute: "ICP Market Terminal | ICPay" },
      robots: { index: false, follow: true },
    }
  }
  const quoteSymbol = pairSlug(token.symbol).split("_")[1] ?? "ICP"
  const title = liveTradeTitle({
    symbol: token.symbol,
    quoteSymbol,
    name: token.name,
    priceUsd: token.stats.priceUsd,
  })
  const description = tradePairDescription({
    symbol: token.symbol,
    quoteSymbol,
    name: token.name,
    priceUsd: token.stats.priceUsd,
  })
  const canonical = `${siteUrl}${tradePairPath(token.symbol)}`
  const keywords = [
    token.symbol,
    token.name,
    `${token.symbol}/ICP`,
    `${token.name} price`,
    "ICPSwap",
    "ICP spot",
    "SNS token",
    "Internet Computer",
    "ICRC-1",
    "ICPay",
  ]
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "ICPay",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export function tradePairJsonLd(token: IcpswapListedToken) {
  const quoteSymbol = pairSlug(token.symbol).split("_")[1] ?? "ICP"
  const url = `${siteUrl}${tradePairPath(token.symbol)}`
  const price = token.stats.priceUsd > 0 ? seoPriceLabel(token.stats.priceUsd) : undefined
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${token.symbol}/${quoteSymbol}`,
    url,
    description: tradePairDescription({
      symbol: token.symbol,
      quoteSymbol,
      name: token.name,
      priceUsd: token.stats.priceUsd,
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Markets", item: `${siteUrl}/market` },
        { "@type": "ListItem", position: 2, name: `${token.symbol}/${quoteSymbol}`, item: url },
      ],
    },
    mainEntity: {
      "@type": "FinancialProduct",
      name: `${token.symbol}/${quoteSymbol}`,
      alternateName: token.name,
      url,
      ...(price
        ? {
            offers: {
              "@type": "Offer",
              price,
              priceCurrency: "USD",
            },
          }
        : {}),
    },
  }
}

export function marketIndexMetadata(tokenCount: number): Metadata {
  const title = {
    absolute: "ICP Token Prices, SNS Markets & ICPSwap Spot Pairs | ICPay",
  }
  const description =
    tokenCount > 0
      ? `Live prices for ${tokenCount} ICPSwap and SNS tokens versus ICP. 24h change, volume, and TVL. Trade spot on the Internet Computer with ICPay.`
      : "Live ICPSwap and SNS token prices, 24h change, volume, and TVL. Open any pair in the ICPay market terminal."
  const url = `${siteUrl}/market`
  return {
    title,
    description,
    keywords: [
      "ICP markets",
      "SNS token price",
      "ICPSwap",
      "Internet Computer tokens",
      "ICRC-1",
      "ckBTC",
      "ckETH",
      "ICPay trade",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: title.absolute,
      description,
      url,
      type: "website",
      siteName: "ICPay",
    },
    twitter: { card: "summary_large_image", title: title.absolute, description },
  }
}

export function marketItemListJsonLd(tokens: IcpswapListedToken[]) {
  const sorted = tokens
    .filter((row) => isTerminalPairBase(row.ledgerId))
    .sort((a, b) => (b.stats.volume24hUsd || 0) - (a.stats.volume24hUsd || 0))
    .slice(0, 40)
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ICP Markets",
    url: `${siteUrl}/market`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sorted.length,
      itemListElement: sorted.map((token, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}${tradePairPath(token.symbol)}`,
        name: `${token.symbol}/ICP`,
      })),
    },
  }
}

export function uniquePairSlugs(tokens: IcpswapListedToken[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const token of tokens) {
    if (!isTerminalPairBase(token.ledgerId)) continue
    const slug = pairSlug(token.symbol)
    if (seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
  }
  return out
}
