import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { CkBtcMinterCanister } from "@icp-sdk/canisters/ckbtc"
import { CkEthMinterCanister } from "@icp-sdk/canisters/cketh"
import { createAgent } from "@/services/icp"
import {
  CKBTC_LEDGER_ID,
  CKBTC_MINTER_ID,
  CKETH_LEDGER_ID,
  CKETH_MINTER_ID,
} from "@/services/chainkey/constants"

export type ChainKeyDeposit = {
  ledgerId: string
  asset: "BTC" | "ETH"
  address: string
}

export function isChainKeyLedger(ledgerId: string): boolean {
  return ledgerId === CKBTC_LEDGER_ID || ledgerId === CKETH_LEDGER_ID
}

export async function fetchChainKeyDeposit(
  ledgerId: string,
  identity: Identity | undefined,
  subaccount?: Uint8Array
): Promise<ChainKeyDeposit | null> {
  if (!identity) return null

  const agent = await createAgent(identity)
  const owner = identity.getPrincipal()

  if (ledgerId === CKBTC_LEDGER_ID) {
    const minter = CkBtcMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKBTC_MINTER_ID),
    })
    const address = await minter.getBtcAddress({
      owner,
      ...(subaccount ? { subaccount } : {}),
    })
    return { ledgerId, asset: "BTC", address }
  }

  if (ledgerId === CKETH_LEDGER_ID) {
    const minter = CkEthMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKETH_MINTER_ID),
    })
    const address = await minter.getSmartContractAddress({ certified: false })
    if (!address || address === "N/A") return null
    return { ledgerId, asset: "ETH", address }
  }

  return null
}
