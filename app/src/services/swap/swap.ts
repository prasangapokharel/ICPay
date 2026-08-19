import type { Identity } from "@icp-sdk/core/agent"
import { call, unwrap, type Outcome } from "@/services/client"
import { isLedgerSupported } from "@/services/tokens"
import { isSwapToken } from "@/lib/swap-tokens"
import { fetchIcpswapQuote } from "@/services/swap/icpswap-quote"
import type { SwapQuoteResult, SwapResult } from "@/services/types"

/** ICPSwap pool queries in the browser — no backend update round-trip. */
export async function fetchSwapQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<SwapQuoteResult> {
  const blocked = await checkSwapPair(identity, tokenIn, tokenOut)
  if (blocked === "sameToken") throw new Error("sameToken")
  if (blocked === "unsupported") throw new Error("unsupported")
  return fetchIcpswapQuote(identity, tokenIn, tokenOut, amountIn)
}

export async function recoverFailedSwapInput(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<bigint> {
  const outcome = await call(identity, "Recovery failed", async (actor) => {
    const r = await actor.recoverFailedSwapInput(tokenIn, tokenOut, amountIn)
    return r as Outcome<bigint>
  })
  return unwrap(outcome)
}

export function executeSwap(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint
): Promise<Outcome<SwapResult>> {
  return call(identity, "Swap failed", async (actor) => {
    const r = await actor.executeSwap(tokenIn, tokenOut, amountIn, amountOutMin)
    return r as Outcome<SwapResult>
  })
}

/** Parallel ledger allowlist queries before showing a pair in the picker. */
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
