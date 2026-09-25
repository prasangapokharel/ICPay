import type { Principal } from "@icp-sdk/core/principal"

export type LimitOrderStatus = "Open" | "Filled" | "Cancelled"

export type CandidOrderStatus =
  | { Open: null }
  | { Filled: null }
  | { Cancelled: null }

export interface CandidLimitOrder {
  id: bigint
  user: Principal
  token_in: string
  token_out: string
  amount_in: bigint
  min_amount_out: bigint
  created_at_ns: bigint
  filled_at_ns: [] | [bigint]
  status: CandidOrderStatus
}

export interface LimitOrder {
  id: bigint
  user: string
  tokenIn: string
  tokenOut: string
  amountIn: bigint
  minAmountOut: bigint
  createdAtNs: bigint
  filledAtNs?: bigint
  status: LimitOrderStatus
}

export interface CandidTradeRecord {
  service_fee: bigint
  tx_id: string
  timestamp_ns: bigint
  token_in: string
  amount_out: bigint
  amount_in: bigint
  token_out: string
}

export interface TradeRecord {
  serviceFee: bigint
  txId: string
  timestampNs: bigint
  tokenIn: string
  amountOut: bigint
  amountIn: bigint
  tokenOut: string
}

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

export type CandidSwapResult = {
  service_fee: bigint
  tx_id: string
  block_index: bigint
  amount_out: bigint
  amount_in: bigint
}

export type CandidSwapQuoteResult = {
  amount_after_fee: bigint
  service_fee: bigint
  amount_out_raw: bigint
  amount_out: bigint
  swap_fee: bigint
  price_impact: string
  pool_id: Principal
}

export type CandidApiResult<T> =
  | { Ok: T }
  | { Err: string }
  | { ok: T }
  | { err: string }

export interface TradeActor {
  health: () => Promise<string>
  get_trading_balance: (user: Principal, token: string) => Promise<bigint>
  get_treasury: () => Promise<Principal>
  get_swap_quote: (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ) => Promise<CandidApiResult<CandidSwapQuoteResult>>
  get_user_trades: (
    user: Principal,
    limit: [] | [bigint]
  ) => Promise<CandidTradeRecord[]>
  get_open_limit_orders: (
    user: [] | [Principal]
  ) => Promise<CandidLimitOrder[]>
  get_user_limit_orders: (
    user: Principal,
    limit: [] | [bigint]
  ) => Promise<CandidLimitOrder[]>
  execute_swap: (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    amountOutMin: bigint
  ) => Promise<CandidApiResult<CandidSwapResult>>
  place_limit_order: (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minAmountOut: bigint
  ) => Promise<CandidApiResult<CandidLimitOrder>>
  cancel_limit_order: (
    orderId: bigint
  ) => Promise<CandidApiResult<bigint>>
  sweep_fees: (
    token: string
  ) => Promise<CandidApiResult<bigint>>
}

export type CandidTradeResult = CandidApiResult<CandidSwapResult>
