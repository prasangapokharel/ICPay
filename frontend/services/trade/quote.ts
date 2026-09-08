import type { Identity } from "@icp-sdk/core/agent"
import { createAgent } from "@/services/icp"
import { icrcTransferFee } from "@/services/ledger/icrc"
import { isSwapBlocked } from "@/lib/swap/config"
import {
  icpswapErrorMessage,
  poolSwapFee,
  quoteIcpswapPool,
  resolveIcpswapPool,
} from "@/lib/swap/icpswap"
import { netSwapOutput } from "@/lib/swap/utils"
import { amountAfterServiceFee, tradeServiceFee } from "@/lib/trade/fees"
import type { TradeQuoteResult } from "@/services/trade/types"

export type TradeQuoteFees = {
  tokenInFee?: bigint
  tokenOutFee?: bigint
}

export async function fetchTradeQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  fees: TradeQuoteFees = {}
): Promise<TradeQuoteResult> {
  if (isSwapBlocked(tokenIn) || isSwapBlocked(tokenOut)) {
    throw new Error("ICPAY cannot be traded on ICPay")
  }
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (amountIn <= 0n) throw new Error("amountIn must be > 0")

  const serviceFee = tradeServiceFee(amountIn)
  const agent = await createAgent(identity)

  const [tokenInFee, tokenOutFee, pool] = await Promise.all([
    icrcTransferFee(identity, tokenIn, fees.tokenInFee),
    icrcTransferFee(identity, tokenOut, fees.tokenOutFee),
    resolveIcpswapPool(agent, tokenIn, tokenOut),
  ])

  const afterService = amountAfterServiceFee(amountIn)
  const quoteAmountIn = afterService > tokenInFee ? afterService - tokenInFee : 0n
  if (quoteAmountIn <= 0n) throw new Error("amountIn too small after fees")

  const grossOut = await quoteIcpswapPool(agent, pool, quoteAmountIn)
  if (grossOut === 0n) throw new Error("No pool liquidity for this trade direction")

  const swapFee = poolSwapFee(quoteAmountIn, pool.fee)
  const netOut = netSwapOutput(grossOut, tokenOutFee)

  return {
    amountOut: netOut,
    amountOutRaw: grossOut,
    serviceFee,
    swapFee,
    priceImpact: "",
    poolId: pool.poolId,
  }
}

export { icpswapErrorMessage }
