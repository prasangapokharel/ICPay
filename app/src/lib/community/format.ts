import { E8S } from '@/lib/wallet-utils'

export const COMMUNITY_MIN_ICP = 0.1
export const COMMUNITY_MAX_ICP = 10

export function formatCommunityPriceE8s(e8s: bigint): string {
  const whole = e8s / E8S
  const frac = e8s % E8S
  if (frac === 0n) return whole.toString()
  const fracStr = frac.toString().padStart(8, '0').replace(/0+$/, '')
  return `${whole}.${fracStr}`
}

export function parseCommunityPriceIcp(value: string): bigint | null {
  const t = value.trim()
  if (t === '' || t === '.' || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n < COMMUNITY_MIN_ICP || n > COMMUNITY_MAX_ICP) return null
  return BigInt(Math.round(n * Number(E8S)))
}

export function formatMessageTime(ns: bigint): string {
  const d = new Date(Number(ns / 1_000_000n))
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatLastActive(ns: bigint): string {
  const d = new Date(Number(ns / 1_000_000n))
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return 'Just now'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`
  if (diffMs < 604_800_000) return `${Math.floor(diffMs / 86_400_000)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
