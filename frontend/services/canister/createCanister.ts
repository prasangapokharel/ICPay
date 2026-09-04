import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { CmcCanister } from "@icp-sdk/canisters/cmc"
import type { CmcDid } from "@icp-sdk/canisters/cmc"
import {
  AccountIdentifier,
  IcpLedgerCanister,
  SubAccount,
} from "@icp-sdk/canisters/ledger/icp"
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
  walletCostForTopUp,
  walletShortfall,
} from "@/services/cycles/topUp"
import {
  fetchSubnetMetaMap,
  type SubnetOption,
} from "@/services/canister/subnetLocations"

/** NNS CMC memo for notify_create_canister ("CREA" little-endian). */
export const CREATE_CANISTER_MEMO = 0x41455243n

export const MIN_CREATE_E8S = 10_000_000n // 0.1 ICP
export const MAX_CREATE_E8S = 5_000_000_000n // 50 ICP

export {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  walletCostForTopUp,
  walletShortfall,
}

export type { SubnetOption }
export { formatSubnetCountries, shortSubnetId } from "@/services/canister/subnetLocations"

export type CreateCanisterFlowStep = "send" | "create" | "done"

export type CreateCanisterOptions = {
  amountE8s: bigint
  /** Extra controllers besides the II caller. */
  extraControllers?: string[]
  /** Specific subnet principal, or omit for CMC default. */
  subnetId?: string | null
}

export type CreateCanisterResult = {
  canisterId: string
  blockIndex: bigint
  amountE8s: bigint
  withdrewFromWallet: boolean
}

export function cmcCreateAccount(controller: Principal): AccountIdentifier {
  return AccountIdentifier.fromPrincipal({
    principal: Principal.fromText(CMC_CANISTER_ID),
    subAccount: SubAccount.fromPrincipal(controller),
  })
}

function emptySettings(): CmcDid.CanisterSettings {
  return {
    freezing_threshold: [],
    wasm_memory_threshold: [],
    environment_variables: [],
    controllers: [],
    reserved_cycles_limit: [],
    log_visibility: [],
    log_memory_limit: [],
    snapshot_visibility: [],
    wasm_memory_limit: [],
    memory_allocation: [],
    compute_allocation: [],
  }
}

export function buildCreateSettings(
  caller: Principal,
  extraControllers: string[] = []
): CmcDid.CanisterSettings | null {
  const controllers: Principal[] = [caller]
  for (const raw of extraControllers) {
    const text = raw.trim()
    if (!text) continue
    const p = Principal.fromText(text)
    if (p.isAnonymous()) throw new Error("Invalid controller principal")
    if (!controllers.some((c) => c.compareTo(p) === "eq")) controllers.push(p)
  }
  if (controllers.length === 1) return null
  return { ...emptySettings(), controllers: [controllers] }
}

export async function fetchDefaultSubnets(identity?: Identity): Promise<SubnetOption[]> {
  const agent = await createAgent(identity)
  const cmc = CmcCanister.create({
    agent,
    canisterId: Principal.fromText(CMC_CANISTER_ID),
  })
  const [list, metaMap] = await Promise.all([
    cmc.getDefaultSubnets({ certified: false }),
    fetchSubnetMetaMap(),
  ])
  return list.map((p) => {
    const id = p.toText()
    const meta = metaMap[id]
    return {
      id,
      countries: meta?.countries ?? [],
      nodeCount: meta?.nodeCount ?? 0,
    }
  })
}

export async function createCanister(
  identity: Identity,
  options: CreateCanisterOptions
): Promise<CreateCanisterResult> {
  const { amountE8s } = options
  if (amountE8s < MIN_CREATE_E8S) throw new Error("Minimum create amount is 0.1 ICP")
  if (amountE8s > MAX_CREATE_E8S) throw new Error("Maximum create amount is 50 ICP per call")

  const controller = identity.getPrincipal()
  const agent = await createAgent(identity)
  const ledger = IcpLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ICP_LEDGER_ID),
  })
  const fee = await fetchIcpTransferFee(identity)
  const to = cmcCreateAccount(controller)

  const blockIndex = await ledger.transfer({
    to,
    amount: amountE8s,
    fee,
    memo: CREATE_CANISTER_MEMO,
  })

  const settings = buildCreateSettings(controller, options.extraControllers ?? [])
  const subnetSelection: [] | [CmcDid.SubnetSelection] =
    options.subnetId && options.subnetId.trim()
      ? [{ Subnet: { subnet: Principal.fromText(options.subnetId.trim()) } }]
      : []

  const cmc = CmcCanister.create({
    agent,
    canisterId: Principal.fromText(CMC_CANISTER_ID),
  })

  const canisterId = await cmc.notifyCreateCanister({
    controller,
    block_index: blockIndex,
    subnet_selection: subnetSelection,
    settings: settings ? [settings] : [],
    subnet_type: [],
  })

  return {
    canisterId: canisterId.toText(),
    blockIndex,
    amountE8s,
    withdrewFromWallet: false,
  }
}

export async function createCanisterFromWallet(
  identity: Identity,
  options: CreateCanisterOptions,
  onStep?: (step: CreateCanisterFlowStep) => void
): Promise<CreateCanisterResult> {
  const { amountE8s } = options
  if (amountE8s < MIN_CREATE_E8S) throw new Error("Minimum create amount is 0.1 ICP")
  if (amountE8s > MAX_CREATE_E8S) throw new Error("Maximum create amount is 50 ICP per call")

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

  onStep?.("create")
  try {
    const result = await createCanister(identity, options)
    onStep?.("done")
    return { ...result, withdrewFromWallet }
  } catch (e) {
    throw new Error(formatCreateCanisterError(e))
  }
}

export function formatCreateCanisterError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "Create failed")
  const lower = raw.toLowerCase()
  if (lower.includes("refunded")) {
    return "ICP was refunded by the CMC. Retry create with a fresh transfer."
  }
  if (lower.includes("invalidtransaction") || lower.includes("invalid_transaction")) {
    return "CMC rejected the transfer (invalid transaction). Retry create."
  }
  if (lower.includes("processing")) {
    return "CMC is still processing. Wait a moment, then check your canisters."
  }
  if (lower.includes("transactiontooold") || lower.includes("too old")) {
    return "Transfer is too old for CMC notify. Start create again."
  }
  if (lower.includes("insufficient") || lower.includes("insufficientfunds")) {
    return "Insufficient ICP for amount + network fee."
  }
  return formatTopUpError(err)
}

export { canisterDashboardUrl } from "@/services/cycles/topUp"
