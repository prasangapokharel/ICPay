import { Principal } from "@icp-sdk/core/principal"
import type { TokenMetadata } from "@/services/tokens"

const KEY = "icpay:custom-tokens:"
export const CUSTOM_TOKENS_EVENT = "icpay-custom-tokens"

const EMPTY: string[] = []
const EMPTY_META = new Map<string, TokenMetadata>()

type StoredMeta = {
  ledgerId: string
  symbol: string
  name: string
  decimals: number
  fee: string
  logo?: string
}

type Stored = { ids: string[]; meta: Record<string, StoredMeta> }

type Snapshot = { serialized: string | null; ids: string[]; meta: Map<string, TokenMetadata> }

const snapshots = new Map<string, Snapshot>()

function parseStored(serialized: string): Stored {
  const parsed = JSON.parse(serialized) as unknown
  if (Array.isArray(parsed)) {
    const ids = parsed.filter((id): id is string => typeof id === "string")
    return { ids, meta: {} }
  }
  if (!parsed || typeof parsed !== "object") return { ids: [], meta: {} }
  const row = parsed as Partial<Stored>
  const ids = Array.isArray(row.ids) ? row.ids.filter((id): id is string => typeof id === "string") : []
  const meta: Record<string, StoredMeta> = {}
  if (row.meta && typeof row.meta === "object") {
    for (const [id, value] of Object.entries(row.meta)) {
      if (!value || typeof value !== "object") continue
      const m = value as Partial<StoredMeta>
      if (
        typeof m.ledgerId === "string" &&
        typeof m.symbol === "string" &&
        typeof m.name === "string" &&
        typeof m.decimals === "number" &&
        typeof m.fee === "string"
      ) {
        meta[id] = {
          ledgerId: m.ledgerId,
          symbol: m.symbol,
          name: m.name,
          decimals: m.decimals,
          fee: m.fee,
          logo: typeof m.logo === "string" ? m.logo : undefined,
        }
      }
    }
  }
  return { ids, meta }
}

function toTokenMeta(stored: StoredMeta): TokenMetadata {
  return {
    ledgerId: stored.ledgerId,
    symbol: stored.symbol,
    name: stored.name,
    decimals: stored.decimals,
    fee: BigInt(stored.fee),
    logo: stored.logo,
  }
}

function cacheSnapshot(principal: string, serialized: string | null, stored: Stored): Snapshot {
  const ids = stored.ids.length === 0 ? EMPTY : [...stored.ids]
  const meta = new Map<string, TokenMetadata>()
  for (const id of ids) {
    const row = stored.meta[id]
    if (row) meta.set(id, toTokenMeta(row))
  }
  const snapshot = { serialized, ids, meta }
  snapshots.set(principal, snapshot)
  return snapshot
}

function readStored(principal: string): Snapshot {
  if (typeof window === "undefined") return { serialized: null, ids: EMPTY, meta: EMPTY_META }

  const serialized = localStorage.getItem(KEY + principal)
  const hit = snapshots.get(principal)
  if (hit && hit.serialized === serialized) return hit

  if (!serialized) return cacheSnapshot(principal, null, { ids: [], meta: {} })

  try {
    return cacheSnapshot(principal, serialized, parseStored(serialized))
  } catch {
    return cacheSnapshot(principal, serialized, { ids: [], meta: {} })
  }
}

export function getCustomLedgerIdsSnapshot(principal: string): string[] {
  return readStored(principal).ids
}

export function getCustomTokenMetaSnapshot(principal: string): Map<string, TokenMetadata> {
  return readStored(principal).meta
}

export function normalizeLedgerId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return Principal.fromText(trimmed).toText()
  } catch {
    return null
  }
}

export function readCustomLedgerIds(principal: string): string[] {
  return getCustomLedgerIdsSnapshot(principal)
}

function writeStored(principal: string, stored: Stored) {
  if (typeof window === "undefined") return
  const serialized = JSON.stringify(stored)
  try {
    localStorage.setItem(KEY + principal, serialized)
    cacheSnapshot(principal, serialized, stored)
    window.dispatchEvent(
      new CustomEvent(CUSTOM_TOKENS_EVENT, { detail: { principal } satisfies { principal: string } })
    )
  } catch {
    // Private-browsing quota rejections must not break the wallet.
  }
}

function readStoredRecord(principal: string): Stored {
  const { ids, meta } = readStored(principal)
  const record: Record<string, StoredMeta> = {}
  for (const [id, row] of meta) {
    record[id] = {
      ledgerId: row.ledgerId,
      symbol: row.symbol,
      name: row.name,
      decimals: row.decimals,
      fee: row.fee.toString(),
      logo: row.logo,
    }
  }
  return { ids: [...ids], meta: record }
}

export function addCustomLedgerId(
  principal: string,
  ledgerId: string,
  meta?: TokenMetadata
): string[] {
  const stored = readStoredRecord(principal)
  const ids = stored.ids.includes(ledgerId) ? stored.ids : [...stored.ids, ledgerId]
  if (meta) {
    stored.meta[ledgerId] = {
      ledgerId: meta.ledgerId,
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
      fee: meta.fee.toString(),
      logo: meta.logo,
    }
  }
  writeStored(principal, { ids, meta: stored.meta })
  return getCustomLedgerIdsSnapshot(principal)
}

export function removeCustomLedgerId(principal: string, ledgerId: string): string[] {
  const stored = readStoredRecord(principal)
  const ids = stored.ids.filter((id) => id !== ledgerId)
  delete stored.meta[ledgerId]
  writeStored(principal, { ids, meta: stored.meta })
  return getCustomLedgerIdsSnapshot(principal)
}

export const EMPTY_CUSTOM_LEDGER_IDS = EMPTY
