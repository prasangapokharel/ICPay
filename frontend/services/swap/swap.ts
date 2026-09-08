import type { Identity } from "@icp-sdk/core/agent"
import { isLedgerSupported } from "@/services/tokens"
import { isSwapToken } from "@/lib/swap/tokens"
import { fetchTradeQuote, type TradeQuoteFees } from "@/services/trade/quote"
import type { TradeQuoteResult } from "@/services/trade/types"

export type { TradeQuoteFees }

export type SwapQuoteOpts = TradeQuoteFees & {
  skipAllowlistCheck?: boolean
}

/** @deprecated Use services/trade — kept for any legacy imports. */
export async function fetchSwapQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  opts: SwapQuoteOpts = {}
): Promise<TradeQuoteResult> {
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (!isSwapToken(tokenIn) || !isSwapToken(tokenOut)) throw new Error("unsupported")

  if (!opts.skipAllowlistCheck) {
    const blocked = await checkSwapPair(identity, tokenIn, tokenOut)
    if (blocked === "sameToken") throw new Error("sameToken")
    if (blocked === "unsupported") throw new Error("unsupported")
  }

  return fetchTradeQuote(identity, tokenIn, tokenOut, amountIn, opts)
}

export async function checkSwapPair(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string
): Promise<"sameToken" | "unsupported" | null> {
  if (tokenIn === tokenOut) return "sameToken"
  if (!isSwapToken(tokenIn) || !isSwapToken(tokenOut)) return "unsupported"
  const [inOk, outOk] = await Promise.all([
    isLedgerSupported(identity, tokenIn),
    isLedgerSupported(identity, tokenOut),
  ])
  if (!inOk || !outOk) return "unsupported"
  return null
}
