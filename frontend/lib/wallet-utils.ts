import type { TxTypeVariant, TxStatusVariant } from "@/services/types"

const ICP_DECIMALS = 8n

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
