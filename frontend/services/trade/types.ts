import type { Principal } from "@icp-sdk/core/principal"

export type TradeQuoteResult = {
  amountOut: bigint
  amountOutRaw: bigint
  serviceFee: bigint
  swapFee: bigint
  priceImpact: string
  poolId: string
}

export type TradeResult = {
  blockIndex: bigint
  amountIn: bigint
  amountOut: bigint
  serviceFee: bigint
  txId: string
}

export type TradeDepositResult = {
  blockIndex: bigint
}

export interface TradeActor {
  execute_swap: (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    amountOutMin: bigint
  ) => Promise<CandidTradeResult>
  get_trading_balance: (user: Principal, token: string) => Promise<bigint>
  health: () => Promise<string>
}

type CandidSwapResult = {
  service_fee: bigint
  tx_id: string
  block_index: bigint
  amount_out: bigint
  amount_in: bigint
}

type CandidTradeResult =
  | { Ok: CandidSwapResult }
  | { Err: string }
  | { ok: CandidSwapResult }
  | { err: string }

export type { CandidTradeResult }
