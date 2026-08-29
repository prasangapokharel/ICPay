import { Principal } from '@icp-sdk/core/principal'
import type { TokenMetadata } from '@/services/tokens'
import { getItem, setItem } from '@/services/storage/kv'

const KEY = 'icpay:custom-tokens:'

type StoredMeta = {
  ledgerId: string
  symbol: string
  name: string
  decimals: number
  fee: string
  logo?: string
}

type Stored = { ids: string[]; meta: Record<string, StoredMeta> }

function parseStored(serialized: string): Stored {
  const parsed = JSON.parse(serialized) as unknown
  if (Array.isArray(parsed)) {
    return { ids: parsed.filter((id): id is string => typeof id === 'string'), meta: {} }
  }
  if (!parsed || typeof parsed !== 'object') return { ids: [], meta: {} }
  const row = parsed as Partial<Stored>
  const ids = Array.isArray(row.ids) ? row.ids.filter((id): id is string => typeof id === 'string') : []
  const meta: Record<string, StoredMeta> = {}
  if (row.meta && typeof row.meta === 'object') {
    for (const [id, value] of Object.entries(row.meta)) {
      if (!value || typeof value !== 'object') continue
      const m = value as Partial<StoredMeta>
      if (
        typeof m.ledgerId === 'string' &&
        typeof m.symbol === 'string' &&
        typeof m.name === 'string' &&
        typeof m.decimals === 'number' &&
        typeof m.fee === 'string'
      ) {
        meta[id] = {
          ledgerId: m.ledgerId,
          symbol: m.symbol,
          name: m.name,
          decimals: m.decimals,
          fee: m.fee,
          logo: typeof m.logo === 'string' ? m.logo : undefined,
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

function readStored(principal: string): Stored {
  const serialized = getItem(KEY + principal)
  if (!serialized) return { ids: [], meta: {} }
  try {
    return parseStored(serialized)
  } catch {
    return { ids: [], meta: {} }
  }
}

function writeStored(principal: string, stored: Stored) {
  setItem(KEY + principal, JSON.stringify(stored))
}

export function getCustomLedgerIdsSnapshot(principal: string): string[] {
  return readStored(principal).ids
}

export function getCustomTokenMetaSnapshot(principal: string): Map<string, TokenMetadata> {
  const stored = readStored(principal)
  const meta = new Map<string, TokenMetadata>()
  for (const id of stored.ids) {
    const row = stored.meta[id]
    if (row) meta.set(id, toTokenMeta(row))
  }
  return meta
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

export function addCustomLedgerId(
  principal: string,
  ledgerId: string,
  meta?: TokenMetadata,
): string[] {
  const stored = readStored(principal)
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
  return ids
}
