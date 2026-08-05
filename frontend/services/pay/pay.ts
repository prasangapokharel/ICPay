import { parseIcp, memoByteLength, MEMO_MAX_BYTES } from "@/lib/wallet-utils"
import { profileUrlFor } from "@/lib/profile-url"
import { validateUsername } from "@/lib/username"
import { isReservedHandle } from "@/lib/reserved-handles"

// A payment request is a URL, not on-chain state: it carries who to pay and what
// for, and authorizes nothing by itself. The payer still reviews and signs, which
// is why a link can be handed out publicly and pinned to a café wall.
export type PaymentRequest = {
  username: string
  // e8s, like every other amount in the app. Absent means "pay me anything".
  amount?: bigint
  memo?: string
}

const AMOUNT_PARAM = "amount"
const MEMO_PARAM = "memo"

// Decimal ICP on the wire, not e8s: the link is read by people, and "18" meaning
// 0.00000018 ICP is the kind of ambiguity that gets someone paid the wrong
// amount. formatAmount caps at 4 decimal places, so the exact e8s value is
// composed here instead -- a request for one e8s has to survive the round trip.
function toDecimalIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n
  const fraction = (e8s % 100_000_000n).toString().padStart(8, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

// Throws rather than silently dropping a field: a link that cannot be paid is
// worse than no link, and the caller is a form that can show the error.
export function buildPaymentLink(req: PaymentRequest): string {
  const username = req.username.trim().toLowerCase()
  if (validateUsername(username) !== null || isReservedHandle(username)) {
    throw new Error(`not a payable username: ${req.username}`)
  }

  const url = new URL(profileUrlFor(username))
  if (req.amount !== undefined) {
    if (req.amount <= 0n) throw new Error("amount must be positive")
    url.searchParams.set(AMOUNT_PARAM, toDecimalIcp(req.amount))
  }

  const memo = req.memo?.trim()
  if (memo) {
    // The ledger caps the memo at 32 bytes and rejects the transfer outright
    // above it, so the link is refused here rather than at the point of payment.
    if (memoByteLength(memo) > MEMO_MAX_BYTES) throw new Error("memo too long")
    url.searchParams.set(MEMO_PARAM, memo)
  }

  return url.toString()
}

// Accepts a full URL, a bare "/alice?amount=5" path, and a leading "@", because
// all three are things people paste. Returns null on anything unpayable -- the
// same contract as parseAddress, so a bad link and a bad QR are handled alike.
export function parsePaymentLink(raw: string): PaymentRequest | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // A relative path has no origin to parse against; the base is only used to
  // make URL() accept it and is never read back.
  let url: URL
  try {
    url = new URL(trimmed, "https://icpay.app")
  } catch {
    return null
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null

  // Exactly one path segment. A deeper path is some other page of the app --
  // /icpverse/alice is a profile view, not a request to pay it.
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length !== 1) return null

  const username = decodeURIComponent(segments[0]).replace(/^@/, "").toLowerCase()
  if (validateUsername(username) !== null || isReservedHandle(username)) return null

  const req: PaymentRequest = { username }

  // An unparseable amount drops the prefill rather than failing the link: the
  // recipient is still right, and the payer can type what they owe.
  const rawAmount = url.searchParams.get(AMOUNT_PARAM)
  if (rawAmount) {
    const amount = parseIcp(rawAmount)
    if (amount !== null) req.amount = amount
  }

  const memo = url.searchParams.get(MEMO_PARAM)?.trim()
  if (memo && memoByteLength(memo) <= MEMO_MAX_BYTES) req.memo = memo

  // Unknown params are ignored on purpose. A link with a tracking tag stapled on
  // by a messaging app should still pay.
  return req
}

// What the transfer form's amount field is set to for a requested amount. The
// same exact form as the wire, not formatAmount: that caps at four decimals and
// would round a small request down before the payer ever saw it.
export function amountFieldValue(amount: bigint): string {
  return toDecimalIcp(amount)
}
