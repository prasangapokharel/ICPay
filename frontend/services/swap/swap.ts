import type { Identity } from "@icp-sdk/core/agent"
import { call, query, unwrap, type Outcome } from "@/services/client"
import { isLedgerSupported } from "@/services/tokens"
import type { SwapQuoteResult, SwapResult } from "@/services/types"

export function fetchSwapQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<SwapQuoteResult> {
  return query(identity, async (actor) => {
    const r = await actor.getSwapQuote(tokenIn, tokenOut, amountIn)
    return unwrap(r as { ok: SwapQuoteResult } | { err: string })
  })
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

/** Parallel ledger allowlist check — two free queries before a pool quote. */
export async function checkSwapPair(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string
): Promise<"sameToken" | "unsupported" | null> {
  if (tokenIn === tokenOut) return "sameToken"
  const [inOk, outOk] = await Promise.all([
    isLedgerSupported(identity, tokenIn),
    isLedgerSupported(identity, tokenOut),
  ])
  if (!inOk || !outOk) return "unsupported"
  return null
}
