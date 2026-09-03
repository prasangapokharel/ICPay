export type FillStatus = "filling" | "filled" | "failed"

export type LocalFill = {
  id: string
  isBuy: boolean
  amount: bigint
  ledgerId: string
  symbol: string
  decimals: number
  at: number
  status: FillStatus
  blockIndex?: bigint | null
}

export type TradeFillNotice = {
  kind: "filled" | "failed"
  id: string
  isBuy: boolean
  symbol: string
  amount: bigint
  decimals: number
  at: number
}

const FILL_KEY = "icpay.tradeFills.v1"

type StoredFill = {
  id: string
  isBuy: boolean
  amount: string
  ledgerId: string
  symbol: string
  decimals: number
  at: number
  status: FillStatus
  blockIndex?: string | null
}

export function serializeFills(rows: LocalFill[]): string {
  const body: StoredFill[] = rows.map((row) => ({
    id: row.id,
    isBuy: row.isBuy,
    amount: row.amount.toString(),
    ledgerId: row.ledgerId,
    symbol: row.symbol,
    decimals: row.decimals,
    at: row.at,
    status: row.status,
    blockIndex: row.blockIndex != null ? row.blockIndex.toString() : null,
  }))
  return JSON.stringify(body)
}

export function parseFills(raw: string): LocalFill[] {
  const body = JSON.parse(raw) as StoredFill[]
  if (!Array.isArray(body)) return []
  return body.flatMap((row) => {
    if (!row?.id || row.amount == null) return []
    return [
      {
        id: row.id,
        isBuy: Boolean(row.isBuy),
        amount: BigInt(row.amount),
        ledgerId: row.ledgerId ?? "",
        symbol: row.symbol ?? "",
        decimals: Number(row.decimals) || 0,
        at: Number(row.at) || 0,
        status: row.status === "failed" || row.status === "filling" ? row.status : "filled",
        blockIndex:
          row.blockIndex != null && row.blockIndex !== "" ? BigInt(row.blockIndex) : null,
      },
    ]
  })
}

function pruneFills(rows: LocalFill[], now = Date.now()): LocalFill[] {
  return rows.filter((row) => {
    if (row.status === "filling") return now - row.at < 15 * 60_000
    if (row.status === "failed") return now - row.at < 60 * 60_000
    return true
  })
}

function readStored(): LocalFill[] {
  try {
    if (typeof sessionStorage === "undefined") return []
    const raw = sessionStorage.getItem(FILL_KEY)
    if (!raw) return []
    return pruneFills(parseFills(raw))
  } catch {
    return []
  }
}

function writeStored(rows: LocalFill[]) {
  try {
    if (typeof sessionStorage === "undefined") return
    sessionStorage.setItem(FILL_KEY, serializeFills(rows))
  } catch {
    /* ignore quota */
  }
}

let fills: LocalFill[] = readStored()
let notice: TradeFillNotice | null = null
const listeners = new Set<() => void>()

function emit() {
  writeStored(fills)
  for (const fn of listeners) fn()
}

export function getTradeFills(): LocalFill[] {
  return fills
}

export function getTradeFillNotice(): TradeFillNotice | null {
  return notice
}

export function subscribeTradeFills(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function addTradeFill(fill: LocalFill) {
  fills = [fill, ...fills].slice(0, 24)
  emit()
}

export function patchTradeFill(id: string, patch: Partial<LocalFill>) {
  fills = fills.map((row) => (row.id === id ? { ...row, ...patch } : row))
  emit()
}

export function setTradeFillNotice(next: TradeFillNotice | null) {
  notice = next
  emit()
}

export function clearTradeFillNotice() {
  notice = null
  emit()
}
