import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { CmcCanister } from "@icp-sdk/canisters/cmc"
import {
  AccountIdentifier,
  IcpLedgerCanister,
} from "@icp-sdk/canisters/ledger/icp"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { CyclesLedgerCanister } from "@icp-sdk/canisters/ledger/cycles"
import { createAgent } from "@/services/icp"
import { CMC_CANISTER_ID } from "@/services/chainkey/constants"
import { ICP_LEDGER_ID } from "@/services/tokens"
import {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  formatTopUpError,
  MAX_TOPUP_E8S,
  MIN_TOPUP_E8S,
  parseCanisterId,
  walletCostForTopUp,
  walletShortfall,
} from "@/services/cycles/topUp"
import { cmcCreateAccount } from "@/services/canister/createCanister"

/** NNS CMC memo for notify_mint_cycles ("MINT" little-endian). */
export const MINT_CYCLES_MEMO = 0x544e494dn

export const CYCLES_LEDGER_ID = "um5iw-rqaaa-aaaaq-qaaba-cai"

export const MIN_MINT_E8S = MIN_TOPUP_E8S
export const MAX_MINT_E8S = MAX_TOPUP_E8S

export type MintCyclesResult = {
  minted: bigint
  balance: bigint
  blockIndex: bigint
  cyclesBlockIndex: bigint
  withdrewFromWallet: boolean
}

export type MintFlowStep = "send" | "mint" | "done"

export type WithdrawCyclesResult = {
  blockIndex: bigint
  canisterId: string
  amount: bigint
}

export {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  walletCostForTopUp,
  walletShortfall,
}

export function cmcMintAccount(controller: Principal): AccountIdentifier {
  return cmcCreateAccount(controller)
}

export async function fetchCyclesLedgerBalance(identity: Identity): Promise<bigint> {
  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(CYCLES_LEDGER_ID),
  })
  return ledger.balance({
    owner: identity.getPrincipal(),
    certified: false,
  })
}

export async function mintCycles(
  identity: Identity,
  amountE8s: bigint
): Promise<MintCyclesResult> {
  if (amountE8s < MIN_MINT_E8S) throw new Error("Minimum mint is 0.01 ICP")
  if (amountE8s > MAX_MINT_E8S) throw new Error("Maximum mint is 50 ICP per call")

  const controller = identity.getPrincipal()
  const agent = await createAgent(identity)
  const ledger = IcpLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ICP_LEDGER_ID),
  })
  const fee = await fetchIcpTransferFee(identity)
  const to = cmcMintAccount(controller)

  const blockIndex = await ledger.transfer({
    to,
    amount: amountE8s,
    fee,
    memo: MINT_CYCLES_MEMO,
  })

  const cmc = CmcCanister.create({
    agent,
    canisterId: Principal.fromText(CMC_CANISTER_ID),
  })
  const ok = await cmc.notifyMintCycles({
    block_index: blockIndex,
    deposit_memo: [],
    to_subaccount: [],
  })

  return {
    minted: ok.minted,
    balance: ok.balance,
    blockIndex,
    cyclesBlockIndex: ok.block_index,
    withdrewFromWallet: false,
  }
}

export async function mintCyclesFromWallet(
  identity: Identity,
  amountE8s: bigint,
  onStep?: (step: MintFlowStep) => void
): Promise<MintCyclesResult> {
  if (amountE8s < MIN_MINT_E8S) throw new Error("Minimum mint is 0.01 ICP")
  if (amountE8s > MAX_MINT_E8S) throw new Error("Maximum mint is 50 ICP per call")

  const { withdraw } = await import("@/services/withdraw/withdraw")
  const fee = await fetchIcpTransferFee(identity)
  const iiBalance = await fetchPrincipalIcpBalance(identity)
  const shortfall = walletShortfall(amountE8s, iiBalance, fee)

  let withdrewFromWallet = false
  if (shortfall > 0n) {
    onStep?.("send")
    const moved = await withdraw(identity, shortfall, identity.getPrincipal().toText())
    if ("err" in moved) throw new Error(moved.err)
    withdrewFromWallet = true
  }

  onStep?.("mint")
  try {
    const result = await mintCycles(identity, amountE8s)
    onStep?.("done")
    return { ...result, withdrewFromWallet }
  } catch (e) {
    throw new Error(formatTopUpError(e))
  }
}

export async function withdrawCyclesToCanister(
  identity: Identity,
  canisterIdText: string,
  amount: bigint
): Promise<WithdrawCyclesResult> {
  if (amount <= 0n) throw new Error("Withdraw amount must be positive")
  const canisterId = parseCanisterId(canisterIdText)
  const agent = await createAgent(identity)
  const ledger = CyclesLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(CYCLES_LEDGER_ID),
  })
  const result = await ledger.withdraw({
    to: canisterId,
    amount,
  })
  if ("Err" in result) {
    throw new Error(formatWithdrawError(result.Err))
  }
  return {
    blockIndex: result.Ok,
    canisterId: canisterId.toText(),
    amount,
  }
}

function formatWithdrawError(err: unknown): string {
  if (!err || typeof err !== "object") return "Withdraw failed"
  if ("InsufficientFunds" in err) {
    const bal = (err as { InsufficientFunds: { balance: bigint } }).InsufficientFunds.balance
    return `Insufficient cycles (balance ${formatCycles(bal)}).`
  }
  if ("InvalidReceiver" in err) return "Invalid receiver canister."
  if ("GenericError" in err) {
    return (err as { GenericError: { message: string } }).GenericError.message
  }
  if ("FailedToWithdraw" in err) {
    return (err as { FailedToWithdraw: { rejection_reason: string } }).FailedToWithdraw
      .rejection_reason
  }
  return formatTopUpError(err)
}

export function formatMintError(err: unknown): string {
  return formatTopUpError(err)
}
