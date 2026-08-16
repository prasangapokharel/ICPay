import type { TxTypeVariant, TxStatusVariant } from "@/services/types"

const ICP_DECIMALS = 8n

export const E8S = 100_000_000n

// Matches Config.ICP_FEE. The ledger charges this on top of every transfer.
export const ICP_FEE = 10_000n

// Account identifiers are 32-byte hashes rendered as hex, so anything else is a
// principal or a username.
const HEX_ACCOUNT_ID = /^[0-9a-fA-F]{64}$/

export function isHexAccountId(s: string): boolean {
  return HEX_ACCOUNT_ID.test(s)
}

// Parses a user-typed ICP amount into e8s. The digits-and-one-dot test rejects
// forms Number() would otherwise accept -- "1e5", "0x10", "-1" -- which a person
// typing an amount never means. Returns null for anything unparseable or <= 0.
export function parseIcp(value: string): bigint | null {
  const t = value.trim()
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return BigInt(Math.round(n * Number(E8S)))
}

// The same parse for any ICRC-1 ledger, done on the digit string rather than
// through Number(). Float math cannot hold 18 significant digits, so a ckETH
// amount like 99.999999999999999999 rounds to 100000000000000000000 and sends
// more than the user typed -- this pads and concatenates instead, so the value
// is exact at every decimals. Excess precision is rejected, not truncated:
// silently dropping a digit changes the amount someone is sending.
export function parseTokenAmount(value: string, decimals: number): bigint | null {
  const t = value.trim()
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null

  const [whole, fraction = ""] = t.split(".")
  if (fraction.length > decimals) return null

  const amount = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0")
  return amount > 0n ? amount : null
}

// Username transfers are stored as "@name" and shown verbatim; addresses and
// principals are far too long for a mobile row, so they get middle-truncated.
export function shortenCounterparty(value: string): string {
  if (value.startsWith("@")) return value
  if (value.length <= 16) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

// navigator.clipboard is unavailable in insecure contexts and older WebViews, so
// the deprecated execCommand path is kept as the fallback -- a wallet address
// that cannot be copied is close to useless.
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
  }
}

// A memo is sent to the ledger as the ICRC-1 memo blob, which the ICP ledger
// caps at 32 bytes. Measured in UTF-8 bytes rather than characters, since an
// emoji costs four; exceeding it fails the transfer at the ledger.
export const MEMO_MAX_BYTES = 32

export function memoByteLength(s: string): number {
  return new TextEncoder().encode(s).length
}

export function formatE8s(amount: bigint): string {
  const whole = amount / 10n ** ICP_DECIMALS
  const fraction = amount % 10n ** ICP_DECIMALS
  const fractionStr = fraction.toString().padStart(Number(ICP_DECIMALS), "0")
  return `${whole.toLocaleString()}.${fractionStr}`
}

export function formatAmount(amount: bigint): string {
  const whole = amount / 10n ** ICP_DECIMALS
  const fraction = amount % 10n ** ICP_DECIMALS
  const fractionStr = fraction.toString().padStart(Number(ICP_DECIMALS), "0")
  const trimmed = fractionStr.replace(/0+$/, "") || "0"
  return `${whole.toLocaleString()}.${trimmed.slice(0, 4)}`
}

// formatAmount assumes ICP's 8 decimals. Other ICRC-1 ledgers differ -- ckETH
// uses 18, ckUSDC 6 -- so a token amount must be scaled by its own value.
export function formatTokenAmount(amount: bigint, decimals: number, maxFraction = 6): string {
  const scale = 10n ** BigInt(decimals)
  const whole = amount / scale
  const fraction = (amount % scale).toString().padStart(decimals, "0")
  const trimmed = fraction.slice(0, maxFraction).replace(/0+$/, "")
  // A nonzero balance too small to show at this precision reads as plain "0",
  // which looks like an empty wallet, so it gets a leading-approximation mark.
  if (!trimmed) return whole === 0n && amount > 0n ? "<0.000001" : whole.toLocaleString()
  return `${whole.toLocaleString()}.${trimmed}`
}

// What formatTokenAmount is not: a value that parseTokenAmount reads back
// unchanged. Separators and a capped fraction are right for display and wrong
// for a field, where they would silently change the amount being sent.
export function toPlainTokenAmount(amount: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals)
  const whole = amount / scale
  const fraction = (amount % scale).toString().padStart(decimals, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

// 6/4 split, used wherever a principal is shown inline next to other text.
// formatPrincipal's 5/5 split is the standalone-field form.
export function shortPrincipal(text: string): string {
  return text.length > 12 ? `${text.slice(0, 6)}…${text.slice(-4)}` : text
}

export function formatPrincipal(p: string): string {
  if (p.length <= 10) return p
  return `${p.slice(0, 5)}...${p.slice(-5)}`
}

// The dashboard indexes by ledger block index, not our internal tx id, so this
// is only linkable once a transfer has settled and reported a block.
export function explorerTxUrl(blockIndex: bigint): string {
  return `https://dashboard.internetcomputer.org/transaction/${blockIndex}`
}

export function formatTime(t: bigint): string {
  const ms = Number(t / 1_000_000n)
  const date = new Date(ms)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTimeIso(t: bigint): string {
  return new Date(Number(t / 1_000_000n)).toISOString()
}

// Returned as catalog keys, not display text: callers look them up under the
// transactions.type / transactions.status namespaces.
export function txTypeLabel(txType: TxTypeVariant): "deposit" | "withdraw" | "transfer" | "fee" {
  if ("deposit" in txType) return "deposit"
  if ("withdraw" in txType) return "withdraw"
  if ("transfer" in txType) return "transfer"
  return "fee"
}

export function txStatusLabel(status: TxStatusVariant): "completed" | "pending" | "failed" | "cancelled" {
  if ("completed" in status) return "completed"
  if ("pending" in status) return "pending"
  if ("failed" in status) return "failed"
  return "cancelled"
}

export function getTxStatusVariant(status: TxStatusVariant): "default" | "secondary" | "destructive" | "outline" {
  const label = txStatusLabel(status)
  switch (label) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}
