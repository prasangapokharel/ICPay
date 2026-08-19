import { parseIcp, memoByteLength, MEMO_MAX_BYTES } from '@/lib/wallet-utils'
import { validateUsername } from '@/lib/username'
import { isReservedHandle } from '@/lib/reserved-handles'

export type PaymentRequest = {
  username: string
  amount?: bigint
  memo?: string
}

function toDecimalIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n
  const fraction = (e8s % 100_000_000n).toString().padStart(8, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

export function parsePaymentLink(raw: string): PaymentRequest | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(trimmed, 'https://icpay.app')
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return null
  const username = decodeURIComponent(segments[0]).replace(/^@/, '').toLowerCase()
  if (validateUsername(username) !== null || isReservedHandle(username)) return null
  const req: PaymentRequest = { username }
  const rawAmount = url.searchParams.get('amount')
  if (rawAmount) {
    const amount = parseIcp(rawAmount)
    if (amount !== null) req.amount = amount
  }
  const memo = url.searchParams.get('memo')?.trim()
  if (memo && memoByteLength(memo) <= MEMO_MAX_BYTES) req.memo = memo
  return req
}

export function amountFieldValue(amount: bigint): string {
  return toDecimalIcp(amount)
}
