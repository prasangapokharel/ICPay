import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import {
  encodeSnapshotId,
  IcManagementCanister,
} from "@icp-sdk/canisters/ic-management"
import { createAgent } from "@/services/icp"
import { parseCanisterId } from "@/services/cycles/topUp"
import {
  formatBytes,
  formatModuleHash,
  formatNsTimestamp,
  parseRunStatus,
  type CanisterRunStatus,
} from "@/lib/canister/format"
import { formatCycles } from "@/services/cycles/topUp"

export type CanisterStatusView = {
  canisterId: string
  runStatus: CanisterRunStatus
  cycles: bigint
  cyclesLabel: string
  memoryLabel: string
  idleBurnLabel: string
  reservedLabel: string
  version: string
  moduleHash: string
  controllers: string[]
  isController: boolean
  freezingThreshold: string
  computeAllocation: string
  memoryAllocation: string
  wasmMemory: string
  stableMemory: string
  snapshotsSize: string
}

export type SnapshotView = {
  id: string
  totalSizeLabel: string
  takenAtLabel: string
}

async function management(identity: Identity): Promise<IcManagementCanister> {
  const agent = await createAgent(identity)
  return IcManagementCanister.create({ agent })
}

export async function fetchCanisterStatus(
  identity: Identity,
  canisterIdText: string
): Promise<CanisterStatusView> {
  const canisterId = parseCanisterId(canisterIdText)
  const mgmt = await management(identity)
  const raw = await mgmt.canisterStatus({ canisterId, certified: false })
  const caller = identity.getPrincipal().toText()
  const controllers = raw.settings.controllers.map((p) => p.toText())

  return {
    canisterId: canisterId.toText(),
    runStatus: parseRunStatus(raw.status),
    cycles: raw.cycles,
    cyclesLabel: formatCycles(raw.cycles),
    memoryLabel: formatBytes(raw.memory_size),
    idleBurnLabel: `${formatCycles(raw.idle_cycles_burned_per_day)} / day`,
    reservedLabel: formatCycles(raw.reserved_cycles),
    version: raw.version.toString(),
    moduleHash: formatModuleHash(raw.module_hash[0] ?? null),
    controllers,
    isController: controllers.includes(caller),
    freezingThreshold: `${raw.settings.freezing_threshold.toString()} s`,
    computeAllocation: `${raw.settings.compute_allocation.toString()}%`,
    memoryAllocation: formatBytes(raw.settings.memory_allocation),
    wasmMemory: formatBytes(raw.memory_metrics.wasm_memory_size),
    stableMemory: formatBytes(raw.memory_metrics.stable_memory_size),
    snapshotsSize: formatBytes(raw.memory_metrics.snapshots_size),
  }
}

function rejectDetails(err: unknown): { code?: number; text: string } {
  if (err && typeof err === "object" && "cause" in err) {
    const cause = (err as { cause?: { code?: { rejectCode?: number; rejectMessage?: string } } })
      .cause
    const code = cause?.code
    if (code && typeof code.rejectMessage === "string") {
      return { code: code.rejectCode, text: code.rejectMessage }
    }
  }
  const raw = err instanceof Error ? err.message : String(err ?? "")
  const codeMatch = raw.match(/Reject code:\s*(\d+)/i)
  const textMatch = raw.match(/Reject text:\s*([^\n]+)/i)
  return {
    code: codeMatch ? Number(codeMatch[1]) : undefined,
    text: textMatch?.[1]?.trim() || raw,
  }
}

/** Management APIs only succeed for controllers — map replica rejects cleanly. */
export function isControllerDenied(err: unknown): boolean {
  const { code, text } = rejectDetails(err)
  const lower = text.toLowerCase()
  if (
    lower.includes("not a controller") ||
    lower.includes("only controllers") ||
    lower.includes("unauthorized") ||
    lower.includes("not authorized") ||
    (lower.includes("caller") && lower.includes("controller"))
  ) {
    return true
  }
  // CanisterReject (4) / CanisterError (5) on management = almost always access denied
  if (code === 4 || code === 5) return true
  const full = err instanceof Error ? err.message.toLowerCase() : lower
  return full.includes("replica returned a rejection")
}

export function formatManageError(err: unknown): string {
  if (isControllerDenied(err)) {
    return "Your Internet Identity is not a controller of this canister."
  }
  const { text } = rejectDetails(err)
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean || /request id:|reject code:/i.test(clean)) {
    return "Request failed. Check the canister ID and try again."
  }
  return clean.length > 140 ? `${clean.slice(0, 140)}…` : clean
}

export async function startCanister(identity: Identity, canisterIdText: string): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.startCanister(parseCanisterId(canisterIdText))
}

export async function stopCanister(identity: Identity, canisterIdText: string): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.stopCanister(parseCanisterId(canisterIdText))
}

export async function fetchCanisterLogs(
  identity: Identity,
  canisterIdText: string
): Promise<{ idx: string; at: string; text: string }[]> {
  const mgmt = await management(identity)
  const res = await mgmt.fetchCanisterLogs(parseCanisterId(canisterIdText))
  return res.canister_log_records.map((row) => ({
    idx: row.idx.toString(),
    at: formatNsTimestamp(row.timestamp_nanos),
    text: new TextDecoder().decode(row.content),
  }))
}

export async function listSnapshots(
  identity: Identity,
  canisterIdText: string
): Promise<SnapshotView[]> {
  const mgmt = await management(identity)
  const list = await mgmt.listCanisterSnapshots({
    canisterId: parseCanisterId(canisterIdText),
  })
  return list.map((s) => ({
    id: encodeSnapshotId(s.id),
    totalSizeLabel: formatBytes(s.total_size),
    takenAtLabel: formatNsTimestamp(s.taken_at_timestamp),
  }))
}

export async function takeSnapshot(
  identity: Identity,
  canisterIdText: string
): Promise<SnapshotView> {
  const mgmt = await management(identity)
  const s = await mgmt.takeCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
  })
  return {
    id: encodeSnapshotId(s.id),
    totalSizeLabel: formatBytes(s.total_size),
    takenAtLabel: formatNsTimestamp(s.taken_at_timestamp),
  }
}

export async function loadSnapshot(
  identity: Identity,
  canisterIdText: string,
  snapshotId: string
): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.loadCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
    snapshotId,
  })
}

export async function deleteSnapshot(
  identity: Identity,
  canisterIdText: string,
  snapshotId: string
): Promise<void> {
  const mgmt = await management(identity)
  await mgmt.deleteCanisterSnapshot({
    canisterId: parseCanisterId(canisterIdText),
    snapshotId,
  })
}

export { Principal }
