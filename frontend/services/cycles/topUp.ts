import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { CmcCanister } from "@icp-sdk/canisters/cmc"
import {
  AccountIdentifier,
  IcpLedgerCanister,
  SubAccount,
} from "@icp-sdk/canisters/ledger/icp"
import { createAgent } from "@/services/icp"
import { CMC_CANISTER_ID } from "@/services/chainkey/constants"
import { ICP_LEDGER_ID } from "@/services/tokens"

/** NNS CMC memo for notify_top_up ("TPUP" little-endian). */
export const TOP_UP_CANISTER_MEMO = 0x50555054n

/** ICP ledger default fee (e8s). Prefer live fee from the ledger when available. */
export const ICP_TRANSFER_FEE_E8S = 10_000n

export const MIN_TOPUP_E8S = 1_000_000n // 0.01 ICP
export const MAX_TOPUP_E8S = 5_000_000_000n // 50 ICP

/**
 * CMC get_icp_xdr_conversion_rate returns XDR permyriad per ICP.
 * 1 XDR = 1T cycles ⇒ cycles = e8s * rate (NNS / CMC convention).
 */
export function estimateCyclesFromE8s(amountE8s: bigint, xdrPermyriadPerIcp: bigint): bigint {
  if (amountE8s <= 0n || xdrPermyriadPerIcp <= 0n) return 0n
  return amountE8s * xdrPermyriadPerIcp
}

export function formatCycles(cycles: bigint): string {
  if (cycles <= 0n) return "0"
  const T = 1_000_000_000_000n
  const B = 1_000_000_000n
  const M = 1_000_000n
  if (cycles >= T) {
    const whole = cycles / T
    const frac = ((cycles % T) * 100n) / T
    return `${whole}.${frac.toString().padStart(2, "0")} T`
  }
  if (cycles >= B) {
    const whole = cycles / B
    const frac = ((cycles % B) * 100n) / B
    return `${whole}.${frac.toString().padStart(2, "0")} B`
  }
  if (cycles >= M) {
    const whole = cycles / M
    const frac = ((cycles % M) * 100n) / M
    return `${whole}.${frac.toString().padStart(2, "0")} M`
  }
  return cycles.toLocaleString("en-US")
}

export function cmcTopUpAccount(canisterId: Principal): AccountIdentifier {
  return AccountIdentifier.fromPrincipal({
    principal: Principal.fromText(CMC_CANISTER_ID),
    subAccount: SubAccount.fromPrincipal(canisterId),
  })
}

export function parseCanisterId(raw: string): Principal {
  const text = raw.trim()
  if (!text) throw new Error("Canister ID is required")
  const p = Principal.fromText(text)
  if (p.isAnonymous()) throw new Error("Invalid canister ID")
  return p
}

export async function fetchCmcXdrPermyriad(identity?: Identity): Promise<bigint> {
  const agent = await createAgent(identity)
  const cmc = CmcCanister.create({
    agent,
    canisterId: Principal.fromText(CMC_CANISTER_ID),
  })
  return cmc.getIcpToCyclesConversionRate({ certified: false })
}

export async function fetchPrincipalIcpBalance(identity: Identity): Promise<bigint> {
  const agent = await createAgent(identity)
  const ledger = IcpLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ICP_LEDGER_ID),
  })
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: identity.getPrincipal(),
  })
  return ledger.accountBalance({ accountIdentifier, certified: false })
}

export async function fetchIcpTransferFee(identity?: Identity): Promise<bigint> {
  try {
    const agent = await createAgent(identity)
    const ledger = IcpLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ICP_LEDGER_ID),
    })
    return await ledger.transactionFee({ certified: false })
  } catch {
    return ICP_TRANSFER_FEE_E8S
  }
}

export type TopUpResult = {
  cycles: bigint
  blockIndex: bigint
  canisterId: string
  withdrewFromWallet: boolean
}

export type TopUpFlowStep = "send" | "mint" | "done"

/** ICP that must sit on the II principal before CMC transfer (amount + ledger fee). */
export function iiNeedForTopUp(amountE8s: bigint, feeE8s: bigint): bigint {
  return amountE8s + feeE8s
}

/** How much to withdraw from the ICPay wallet onto II (0 if II already covers it). */
export function walletShortfall(
  amountE8s: bigint,
  iiBalanceE8s: bigint,
  feeE8s: bigint
): bigint {
  const need = iiNeedForTopUp(amountE8s, feeE8s)
  return iiBalanceE8s >= need ? 0n : need - iiBalanceE8s
}

/** Total ICP drained from the wallet when a shortfall withdraw is required. */
export function walletCostForTopUp(
  amountE8s: bigint,
  iiBalanceE8s: bigint,
  feeE8s: bigint
): bigint {
  const shortfall = walletShortfall(amountE8s, iiBalanceE8s, feeE8s)
  return shortfall === 0n ? 0n : shortfall + feeE8s
}

/** Largest top-up amount affordable from wallet + II after ledger fees. */
export function maxTopUpAmount(
  walletBalanceE8s: bigint,
  iiBalanceE8s: bigint,
  feeE8s: bigint
): bigint {
  const iiOnly = iiBalanceE8s > feeE8s ? iiBalanceE8s - feeE8s : 0n
  const withWallet =
    walletBalanceE8s + iiBalanceE8s >= feeE8s * 2n
      ? walletBalanceE8s + iiBalanceE8s - feeE8s * 2n
      : 0n
  const max = iiOnly > withWallet ? iiOnly : withWallet
  return max > MAX_TOPUP_E8S ? MAX_TOPUP_E8S : max
}

export async function topUpCanister(
  identity: Identity,
  canisterIdText: string,
  amountE8s: bigint
): Promise<TopUpResult> {
  if (amountE8s < MIN_TOPUP_E8S) throw new Error("Minimum top-up is 0.01 ICP")
  if (amountE8s > MAX_TOPUP_E8S) throw new Error("Maximum top-up is 50 ICP per call")

  const canisterId = parseCanisterId(canisterIdText)
  const agent = await createAgent(identity)
  const ledger = IcpLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ICP_LEDGER_ID),
  })
  const fee = await fetchIcpTransferFee(identity)
  const to = cmcTopUpAccount(canisterId)

  const blockIndex = await ledger.transfer({
    to,
    amount: amountE8s,
    fee,
    memo: TOP_UP_CANISTER_MEMO,
  })

  const cmc = CmcCanister.create({
    agent,
    canisterId: Principal.fromText(CMC_CANISTER_ID),
  })
  const cycles = await cmc.notifyTopUp({
    block_index: blockIndex,
    canister_id: canisterId,
  })

  return {
    cycles,
    blockIndex,
    canisterId: canisterId.toText(),
    withdrewFromWallet: false,
  }
}

/**
 * Prefer ICPay wallet ICP: withdraw any shortfall to the II principal, then
 * mint cycles via CMC. CMC still requires the final transfer from the II principal.
 */
export async function topUpFromWallet(
  identity: Identity,
  canisterIdText: string,
  amountE8s: bigint,
  onStep?: (step: TopUpFlowStep) => void
): Promise<TopUpResult> {
  if (amountE8s < MIN_TOPUP_E8S) throw new Error("Minimum top-up is 0.01 ICP")
  if (amountE8s > MAX_TOPUP_E8S) throw new Error("Maximum top-up is 50 ICP per call")

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
    const result = await topUpCanister(identity, canisterIdText, amountE8s)
    onStep?.("done")
    return { ...result, withdrewFromWallet }
  } catch (e) {
    throw new Error(formatTopUpError(e))
  }
}

/** Official IC dashboard canister page. */
export function canisterDashboardUrl(canisterId: string): string {
  return `https://dashboard.internetcomputer.org/canister/${canisterId}`
}

/**
 * Lightweight existence check via DFINITY's public IC API index.
 * 404 → unknown / not indexed; network errors are ignored (don't block top-up).
 */
export async function verifyCanisterExists(canisterIdText: string): Promise<"ok" | "missing" | "unknown"> {
  let id: string
  try {
    id = parseCanisterId(canisterIdText).toText()
  } catch {
    return "missing"
  }
  try {
    const res = await fetch(
      `https://ic-api.internetcomputer.org/api/v3/canisters/${encodeURIComponent(id)}`,
      { method: "GET", signal: AbortSignal.timeout(8_000) }
    )
    if (res.status === 404) return "missing"
    if (!res.ok) return "unknown"
    return "ok"
  } catch {
    return "unknown"
  }
}

/** Map CMC / ledger / wallet errors to short UI copy. */
export function formatTopUpError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "Top-up failed")
  const lower = raw.toLowerCase()
  if (lower.includes("refunded")) {
    return "ICP was refunded by the CMC. Retry the top-up."
  }
  if (lower.includes("invalidtransaction") || lower.includes("invalid_transaction")) {
    return "CMC rejected the transfer (invalid transaction). Retry with a fresh amount."
  }
  if (lower.includes("processing")) {
    return "CMC is still processing. Wait a moment and check the dashboard."
  }
  if (lower.includes("transactiontooold") || lower.includes("too old")) {
    return "Transfer is too old for CMC notify. Start the top-up again."
  }
  if (lower.includes("insufficient") || lower.includes("insufficientfunds")) {
    return "Insufficient ICP for amount + network fee."
  }
  return raw.length > 180 ? `${raw.slice(0, 180)}…` : raw
}
