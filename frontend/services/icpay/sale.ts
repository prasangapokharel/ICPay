import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { getWalletActor } from "@/services/wallet"
import { call, type Outcome } from "@/services/client"
import type { IcpayPurchase, IcpaySaleQuote } from "@/services/wallet"

export type { IcpayPurchase, IcpaySaleQuote }

async function publicRead<T>(fn: (actor: Awaited<ReturnType<typeof getWalletActor>>) => Promise<T>): Promise<T> {
  return fn(await getWalletActor(undefined))
}

export function getIcpaySale(): Promise<IcpaySaleQuote> {
  return publicRead((actor) => actor.getIcpaySale())
}

export function buyIcpay(
  identity: Identity | undefined,
  icpAmount: bigint,
  recipient?: Principal
): Promise<Outcome<IcpayPurchase>> {
  return call(identity, "Purchase failed", (actor) =>
    actor.buyIcpay(icpAmount, recipient ? [recipient] : [])
  )
}

export function icpayReceiveAmount(icpAmount: bigint, rate: bigint): bigint {
  return icpAmount * rate
}
