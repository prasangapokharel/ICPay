import { Actor, type HttpAgent } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import {
  ICPSWAP_FACTORY_ID,
  ICPSWAP_FEE_TIERS,
  icpSwapTokenStandard,
  swapPairKey,
} from "@/lib/swap/config"

/** Official ICPSwap SwapFactory + SwapPool shapes (camelCase). */
export type IcpswapPoolRef = {
  poolId: string
  token0: string
  fee: number
  zeroForOne: boolean
}

type IcpswapError =
  | { CommonError: null }
  | { InternalError: string }
  | { UnsupportedToken: string }
  | { InsufficientFunds: null }

type PoolData = {
  canisterId: { toText(): string }
  fee: bigint
  key: string
  tickSpacing: bigint
  token0: { address: string; standard: string }
  token1: { address: string; standard: string }
}

const poolCache = new Map<string, Omit<IcpswapPoolRef, "zeroForOne">>()

const factoryIdl: IDL.InterfaceFactory = ({ IDL }) => {
  const Token = IDL.Record({ address: IDL.Text, standard: IDL.Text })
  const Error = IDL.Variant({
    CommonError: IDL.Null,
    InternalError: IDL.Text,
    UnsupportedToken: IDL.Text,
    InsufficientFunds: IDL.Null,
  })
  const PoolData = IDL.Record({
    canisterId: IDL.Principal,
    fee: IDL.Nat,
    key: IDL.Text,
    tickSpacing: IDL.Int,
    token0: Token,
    token1: Token,
  })
  return IDL.Service({
    getPool: IDL.Func(
      [IDL.Record({ fee: IDL.Nat, token0: Token, token1: Token })],
      [IDL.Variant({ ok: PoolData, err: Error })],
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
      [
        IDL.Record({
          amountIn: IDL.Text,
          zeroForOne: IDL.Bool,
          amountOutMinimum: IDL.Text,
        }),
      ],
      [IDL.Variant({ ok: IDL.Nat, err: Error })],
      ["query"]
    ),
  })
}

export function icpswapErrorMessage(err: IcpswapError): string {
  if ("InternalError" in err) return `Internal error: ${err.InternalError}`
  if ("UnsupportedToken" in err) return `Unsupported token: ${err.UnsupportedToken}`
  if ("InsufficientFunds" in err) return "Insufficient funds"
  return "Common error"
}

export async function resolveIcpswapPool(
  agent: HttpAgent,
  tokenIn: string,
  tokenOut: string
): Promise<IcpswapPoolRef> {
  const cacheKey = swapPairKey(tokenIn, tokenOut)
  const cached = poolCache.get(cacheKey)
  if (cached) {
    return { ...cached, zeroForOne: tokenIn === cached.token0 }
  }

  const factory = Actor.createActor<{
    getPool: (args: {
      fee: bigint
      token0: { address: string; standard: string }
      token1: { address: string; standard: string }
    }) => Promise<{ ok?: PoolData; err?: IcpswapError }>
  }>(factoryIdl, { agent, canisterId: ICPSWAP_FACTORY_ID })

  const [t0, t1] = tokenIn < tokenOut ? [tokenIn, tokenOut] : [tokenOut, tokenIn]
  const token0 = { address: t0, standard: icpSwapTokenStandard(t0) }
  const token1 = { address: t1, standard: icpSwapTokenStandard(t1) }

  for (const fee of ICPSWAP_FEE_TIERS) {
    const result = await factory.getPool({ fee: BigInt(fee), token0, token1 })
    if (result.ok) {
      const pool = {
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

export async function quoteIcpswapPool(
  agent: HttpAgent,
  pool: IcpswapPoolRef,
  amountIn: bigint
): Promise<bigint> {
  if (amountIn <= 0n) return 0n

  const poolActor = Actor.createActor<{
    quote: (args: {
      amountIn: string
      zeroForOne: boolean
      amountOutMinimum: string
    }) => Promise<{ ok?: bigint; err?: IcpswapError }>
  }>(poolIdl, { agent, canisterId: pool.poolId })

  const quoteResult = await poolActor.quote({
    amountIn: amountIn.toString(),
    zeroForOne: pool.zeroForOne,
    amountOutMinimum: "0",
  })

  if (quoteResult.err) {
    throw new Error(`Quote failed: ${icpswapErrorMessage(quoteResult.err)}`)
  }

  return quoteResult.ok ?? 0n
}

export function poolSwapFee(amountIn: bigint, feeTier: number): bigint {
  return (amountIn * BigInt(feeTier)) / 1_000_000n
}
