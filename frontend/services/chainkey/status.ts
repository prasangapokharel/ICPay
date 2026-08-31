import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { BitcoinCanister, CkBtcMinterCanister } from "@icp-sdk/canisters/ckbtc"
import { CkEthMinterCanister } from "@icp-sdk/canisters/cketh"
import { createAgent } from "@/services/icp"
import {
  CKBTC_MINTER_ID,
  CKETH_MINTER_ID,
} from "@/services/chainkey/constants"

import { IC_MANAGEMENT_CANISTER_ID } from "@/lib/ic/constants"

export type BtcWithdrawalFee = {
  minterFee: bigint
  bitcoinFee: bigint
}

export async function mintCkBtcFromDeposit(identity: Identity) {
  const agent = await createAgent(identity)
  const minter = CkBtcMinterCanister.create({
    agent,
    canisterId: Principal.fromText(CKBTC_MINTER_ID),
  })
  return minter.updateBalance({ owner: identity.getPrincipal() })
}

export async function fetchPendingBtcSats(
  identity: Identity | undefined,
  btcAddress: string
): Promise<bigint> {
  const agent = await createAgent(identity)
  const bitcoin = BitcoinCanister.create({
    agent,
    canisterId: Principal.fromText(IC_MANAGEMENT_CANISTER_ID),
  })
  return bitcoin.getBalanceQuery({
    address: btcAddress,
    network: "mainnet",
  })
}

export async function fetchBtcWithdrawalFee(
  identity?: Identity
): Promise<BtcWithdrawalFee> {
  const agent = await createAgent(identity)
  const minter = CkBtcMinterCanister.create({
    agent,
    canisterId: Principal.fromText(CKBTC_MINTER_ID),
  })
  const fee = await minter.estimateWithdrawalFee({ certified: false, amount: undefined })
  return {
    minterFee: fee.minter_fee,
    bitcoinFee: fee.bitcoin_fee,
  }
}

export async function fetchEthGasEstimate(identity?: Identity) {
  const agent = await createAgent(identity)
  const minter = CkEthMinterCanister.create({
    agent,
    canisterId: Principal.fromText(CKETH_MINTER_ID),
  })
  return minter.eip1559TransactionPrice({ certified: false })
}

export type BtcWithdrawalRow = {
  id: bigint
  status: string
  amount: bigint
  address: string
}

function btcStatusLabel(status: unknown): string {
  if (status == null) return "Unknown"
  if (typeof status === "object") {
    return Object.keys(status as Record<string, unknown>)[0] ?? "Unknown"
  }
  return String(status)
}

export async function fetchBtcWithdrawalStatuses(
  identity: Identity
): Promise<BtcWithdrawalRow[]> {
  const agent = await createAgent(identity)
  const minter = CkBtcMinterCanister.create({
    agent,
    canisterId: Principal.fromText(CKBTC_MINTER_ID),
  })
  const rows = await minter.retrieveBtcStatusV2ByAccount({
    certified: false,
    account: { owner: identity.getPrincipal() },
  })
  return rows.map((row) => ({
    id: row.id,
    status: btcStatusLabel(row.status),
    amount: 0n,
    address: "",
  }))
}
