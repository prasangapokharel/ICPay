import type { TxTypeVariant, TxStatusVariant } from "@/services/types"

const ICP_DECIMALS = 8n

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

export function formatPrincipal(p: string): string {
  if (p.length <= 10) return p
  return `${p.slice(0, 5)}...${p.slice(-5)}`
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

export function txTypeLabel(txType: TxTypeVariant): string {
  if ("deposit" in txType) return "deposit"
  if ("withdraw" in txType) return "withdraw"
  if ("transfer" in txType) return "transfer"
  return "fee"
}

export function txStatusLabel(status: TxStatusVariant): string {
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
