import { Actor, type Identity } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import { createAgent } from "@/services/icp"
import { icrcLedger } from "@/services/ledger/icrc"
import {
  ICPSWAP_FACTORY_ID,
  ICPSWAP_FEE_TIERS,
  icpSwapTokenStandard,
  isSwapBlocked,
  swapPairKey,
} from "@/lib/swap/config"
import { icpServiceFee, netSwapOutput } from "@/lib/swap/utils"
import type { SwapQuoteResult } from "@/services/types"

type PoolRef = {
  poolId: string
  token0: string
  fee: number
}

type IcpswapError =
  | { CommonError: null }
  | { InternalError: string }
  | { UnsupportedToken: string }
  | { InsufficientFunds: null }

const poolCache = new Map<string, PoolRef>()

const factoryIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Token = IDL.Record({ address: IDL.Text, standard: IDL.Text })
  const Error = IDL.Variant({
    CommonError: IDL.Null,
    InternalError: IDL.Text,
    UnsupportedToken: IDL.Text,
    InsufficientFunds: IDL.Null,
  })
  return IDL.Service({
    getPool: IDL.Func(
      [IDL.Record({ token0: Token, token1: Token, fee: IDL.Nat })],
      [IDL.Variant({ ok: IDL.Record({ canisterId: IDL.Principal, fee: IDL.Nat, token0: Token }), err: Error })],
      ["query"]
    ),
  })
}

const poolIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    CommonError: IDL.Null,
    InternalError: IDL.Text,
    UnsupportedToken: IDL.Text,
    InsufficientFunds: IDL.Null,
  })
  return IDL.Service({
    quote: IDL.Func(
      [IDL.Record({ zeroForOne: IDL.Bool, amountIn: IDL.Text, amountOutMinimum: IDL.Text })],
      [IDL.Variant({ ok: IDL.Nat, err: Error })],
      ["query"]
    ),
  })
}

function icpswapErrorMessage(err: IcpswapError): string {
  if ("InternalError" in err) return `Internal error: ${err.InternalError}`
  if ("UnsupportedToken" in err) return `Unsupported token: ${err.UnsupportedToken}`
  if ("InsufficientFunds" in err) return "Insufficient funds"
  return "Common error"
}

async function ledgerFee(identity: Identity | undefined, ledgerId: string): Promise<bigint> {
  const ledger = await icrcLedger(identity, ledgerId)
  return ledger.transactionFee({ certified: false })
}

async function resolvePool(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string
): Promise<PoolRef & { zeroForOne: boolean }> {
  const cacheKey = swapPairKey(tokenIn, tokenOut)
  const cached = poolCache.get(cacheKey)
  if (cached) {
    return { ...cached, zeroForOne: tokenIn === cached.token0 }
  }

  const agent = await createAgent(identity)
  const factory = Actor.createActor<{
    getPool: (args: {
      token0: { address: string; standard: string }
      token1: { address: string; standard: string }
      fee: bigint
    }) => Promise<{ ok?: { canisterId: { toText(): string }; fee: bigint; token0: { address: string } }; err?: IcpswapError }>
  }>(factoryIdl, { agent, canisterId: ICPSWAP_FACTORY_ID })

  const [t0, t1] = tokenIn < tokenOut ? [tokenIn, tokenOut] : [tokenOut, tokenIn]
  const token0 = { address: t0, standard: icpSwapTokenStandard(t0) }
  const token1 = { address: t1, standard: icpSwapTokenStandard(t1) }

  const hits = await Promise.all(
    ICPSWAP_FEE_TIERS.map((fee) => factory.getPool({ token0, token1, fee: BigInt(fee) }))
  )

  for (const result of hits) {
    if (result.ok) {
      const pool: PoolRef = {
        poolId: result.ok.canisterId.toText(),
        token0: result.ok.token0.address,
        fee: Number(result.ok.fee),
      }
      poolCache.set(cacheKey, pool)
      return { ...pool, zeroForOne: tokenIn === pool.token0 }
    }
  }

  throw new Error(`No pool found for ${tokenIn} / ${tokenOut}`)
}

/** Free ICPSwap queries — full tokenIn to pool; ICP service fee is separate. */
export async function fetchIcpswapQuote(
  identity: Identity | undefined,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<SwapQuoteResult> {
  if (isSwapBlocked(tokenIn) || isSwapBlocked(tokenOut)) {
    throw new Error("ICPAY cannot be swapped on ICPay")
  }
  if (tokenIn === tokenOut) throw new Error("sameToken")
  if (amountIn <= 0n) throw new Error("amountIn must be > 0")

  const serviceFee = icpServiceFee()

  const [tokenInFee, tokenOutFee, pool] = await Promise.all([
    ledgerFee(identity, tokenIn),
    ledgerFee(identity, tokenOut),
    resolvePool(identity, tokenIn, tokenOut),
  ])

  const quoteAmountIn = amountIn - tokenInFee
  if (quoteAmountIn <= 0n) throw new Error("amountIn too small after ledger fee")

  const agent = await createAgent(identity)
  const poolActor = Actor.createActor<{
    quote: (args: {
      zeroForOne: boolean
      amountIn: string
      amountOutMinimum: string
    }) => Promise<{ ok?: bigint; err?: IcpswapError }>
  }>(poolIdl, { agent, canisterId: pool.poolId })

  const quoteResult = await poolActor.quote({
    zeroForOne: pool.zeroForOne,
    amountIn: quoteAmountIn.toString(),
    amountOutMinimum: "0",
  })

  if (quoteResult.err) {
    throw new Error(`Quote failed: ${icpswapErrorMessage(quoteResult.err)}`)
  }

  const grossOut = quoteResult.ok ?? 0n
  if (grossOut === 0n) throw new Error("No pool liquidity for this swap direction")

  const swapFee = (quoteAmountIn * BigInt(pool.fee)) / 1_000_000n
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
