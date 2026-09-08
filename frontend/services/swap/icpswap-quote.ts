import type { Identity } from "@icp-sdk/core/agent"
import { createAgent } from "@/services/icp"
import { icrcTransferFee } from "@/services/ledger/icrc"
import { isSwapBlocked } from "@/lib/swap/config"
import { poolSwapFee, quoteIcpswapPool, resolveIcpswapPool } from "@/lib/swap/icpswap"
import { icpServiceFee, netSwapOutput } from "@/lib/swap/utils"
import type { SwapQuoteResult } from "@/services/types"

export type SwapQuoteFees = {
  tokenInFee?: bigint
  tokenOutFee?: bigint
}

/** Free ICPSwap queries — full tokenIn to pool; ICP service fee is separate (legacy swap). */
export async function fetchIcpswapQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  fees: SwapQuoteFees = {}
): Promise<SwapQuoteResult> {
  if (isSwapBlocked(tokenIn) || isSwapBlocked(tokenOut)) {
    throw new Error("ICPAY cannot be swapped on ICPay")
  }
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (amountIn <= 0n) throw new Error("amountIn must be > 0")

  const serviceFee = icpServiceFee()
  const agent = await createAgent(identity)

  const [tokenInFee, tokenOutFee, pool] = await Promise.all([
    icrcTransferFee(identity, tokenIn, fees.tokenInFee),
    icrcTransferFee(identity, tokenOut, fees.tokenOutFee),
    resolveIcpswapPool(agent, tokenIn, tokenOut),
  ])

  const quoteAmountIn = amountIn - tokenInFee
  if (quoteAmountIn <= 0n) throw new Error("amountIn too small after ledger fee")

  const grossOut = await quoteIcpswapPool(agent, pool, quoteAmountIn)
  if (grossOut === 0n) throw new Error("No pool liquidity for this swap direction")

  const swapFee = poolSwapFee(quoteAmountIn, pool.fee)
  const netOut = netSwapOutput(grossOut, tokenOutFee)

  return {
    amountOut: netOut,
    amountOutRaw: grossOut,
    icpServiceFee: serviceFee,
    swapFee,
    priceImpact: "",
    poolId: pool.poolId,
  }
}
