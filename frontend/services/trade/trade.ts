import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import { getWalletActor } from "@/services/wallet"
import { isSwapToken } from "@/lib/swap/tokens"
import { isLedgerSupported } from "@/services/tokens"
import { getTradeActor } from "@/services/trade/actor"
import { fetchTradeQuote, type TradeQuoteFees } from "@/services/trade/quote"
import type { TradeDepositResult, TradeQuoteResult, TradeResult } from "@/services/trade/types"

export type TradeQuoteOpts = TradeQuoteFees & {
  skipAllowlistCheck?: boolean
}

export { fetchTradeQuote }

/** Preload wallet actor while the user reviews the confirm drawer. */
export async function warmTradeSession(identity: Identity | undefined): Promise<void> {
  if (!identity) return
  await getWalletActor(identity)
}

export async function getTradingBalance(
  identity: Identity | undefined,
  token: string
): Promise<bigint> {
  if (!identity) return 0n
  const actor = await getTradeActor(identity)
  return actor.get_trading_balance(identity.getPrincipal(), token)
}

export async function depositForTrade(
  identity: Identity | undefined,
  token: string,
  amount: bigint
): Promise<Outcome<TradeDepositResult>> {
  return call(identity, "Deposit failed", async (actor) => {
    const r = await actor.depositForTrade(token, amount)
    return r as Outcome<TradeDepositResult>
  })
}

export async function withdrawFromTrade(
  identity: Identity | undefined,
  token: string,
  amount: bigint
): Promise<Outcome<TradeDepositResult>> {
  return call(identity, "Withdraw failed", async (actor) => {
    const r = await actor.withdrawFromTrade(token, amount)
    return r as Outcome<TradeDepositResult>
  })
}

function toTradeResult(ok: {
  blockIndex: bigint
  amountIn: bigint
  amountOut: bigint
  icpServiceFee: bigint
  txId: string
}): TradeResult {
  return {
    blockIndex: ok.blockIndex,
    amountIn: ok.amountIn,
    amountOut: ok.amountOut,
    serviceFee: ok.icpServiceFee,
    txId: ok.txId,
  }
}

/** One wallet update: fund (top-up only if needed) → swap. Output stays on trade balance. */
export async function runTrade(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint
): Promise<Outcome<TradeResult>> {
  return call<TradeResult>(identity, "Trade failed", async (actor) => {
    const r = await actor.executeTrade(tokenIn, tokenOut, amountIn, amountOutMin)
    if ("ok" in r && r.ok !== undefined) {
      return { ok: toTradeResult(r.ok) }
    }
    return { err: "err" in r ? (r.err ?? "Trade failed") : "Trade failed" }
  })
}

export async function fetchTradeQuoteChecked(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  opts: TradeQuoteOpts = {}
): Promise<TradeQuoteResult> {
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (!isSwapToken(tokenIn) || !isSwapToken(tokenOut)) throw new Error("unsupported")

  if (!opts.skipAllowlistCheck) {
    const blocked = await checkTradePair(identity, tokenIn, tokenOut)
    if (blocked === "sameToken") throw new Error("sameToken")
    if (blocked === "unsupported") throw new Error("unsupported")
  }

  return fetchTradeQuote(identity, tokenIn, tokenOut, amountIn, opts)
}

export async function checkTradePair(
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

export async function tradeHealth(identity?: Identity): Promise<string> {
  const actor = await getTradeActor(identity)
  return actor.health()
}
