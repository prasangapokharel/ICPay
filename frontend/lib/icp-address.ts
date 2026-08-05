import { Principal } from "@dfinity/principal"
import { crc32, base32NoPad } from "@/lib/account-id"
import { isHexAccountId } from "@/lib/wallet-utils"
import { validateUsername } from "@/lib/username"
import { isReservedHandle } from "@/lib/reserved-handles"

export type ScannedAddress =
  | { kind: "account"; accountId: string }
  | { kind: "icrc1"; owner: string; subaccount: Uint8Array; text: string }
  | { kind: "principal"; principal: string }
  | { kind: "username"; username: string }

const SUBACCOUNT_BYTES = 32

// Wallets hand out addresses as bare text or wrapped in a payment URI, and the
// query tail carries hints (amount, memo) this form collects on its own screens.
function stripUri(raw: string): string {
  const trimmed = raw.trim()
  const withoutScheme = trimmed.replace(/^(icp|ic|internet-computer):/i, "")
  return withoutScheme.split(/[?#]/)[0].trim()
}

function fromHex(hex: string): Uint8Array | null {
  // The encoder strips leading zeros, which can cut a byte in half, so an odd
  // length is expected rather than malformed.
  const even = hex.length % 2 === 0 ? hex : `0${hex}`
  const out = new Uint8Array(even.length / 2)
  for (let i = 0; i < out.length; i++) {
    const pair = even.slice(i * 2, i * 2 + 2)
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) return null
    out[i] = Number.parseInt(pair, 16)
  }
  return out
}

// icrc1Account strips leading zero bytes before hex-encoding, so the subaccount
// is right-aligned into a full-width buffer to recover the bytes it hashed.
function padSubaccount(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length > SUBACCOUNT_BYTES) return null
  const out = new Uint8Array(SUBACCOUNT_BYTES)
  out.set(bytes, SUBACCOUNT_BYTES - bytes.length)
  return out
}

function checksumFor(owner: Principal, subaccount: Uint8Array): string {
  const principalBytes = owner.toUint8Array()
  const payload = new Uint8Array(principalBytes.length + subaccount.length)
  payload.set(principalBytes, 0)
  payload.set(subaccount, principalBytes.length)

  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, crc32(payload), false)
  return base32NoPad(bytes)
}

// The long ICRC-1 form is `<principal>-<checksum>.<subaccount>`. Principals
// contain dashes of their own, so the split is on the last one.
function parseIcrc1(value: string): ScannedAddress | null {
  const dot = value.indexOf(".")
  if (dot < 0) return null

  const head = value.slice(0, dot)
  const dash = head.lastIndexOf("-")
  if (dash < 0) return null

  const ownerText = head.slice(0, dash)
  const claimed = head.slice(dash + 1)
  const subHex = value.slice(dot + 1)
  if (!claimed || !subHex) return null

  let owner: Principal
  try {
    owner = Principal.fromText(ownerText)
  } catch {
    return null
  }

  const decoded = fromHex(subHex)
  if (!decoded) return null
  const subaccount = padSubaccount(decoded)
  if (!subaccount) return null

  // A mismatch means the scan was misread rather than that the address is
  // exotic, and sending to a corrupted destination is unrecoverable.
  if (checksumFor(owner, subaccount) !== claimed.toLowerCase()) return null

  // A zero subaccount is the owner's default account, which the plain principal
  // already addresses.
  if (subaccount.every((b) => b === 0)) {
    return { kind: "principal", principal: owner.toText() }
  }

  return { kind: "icrc1", owner: owner.toText(), subaccount, text: value }
}

// An ICPay payment link names the recipient in its path -- icpay.app/alice. The
// amount and memo it may also carry are not part of an address, so they are read
// separately by the form that prefills them (services/pay).
//
// Without this, ICPay's own scanner could not read ICPay's own QR: a URL is not
// hex, not ICRC-1, not a principal, and too long to be a username.
function usernameFromUrl(raw: string): ScannedAddress | null {
  if (!/^https?:\/\//i.test(raw)) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  // Exactly one segment. A deeper path is a different page of the app --
  // /icpverse/alice is a profile to look at, not a request to pay.
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length !== 1) return null

  const username = decodeURIComponent(segments[0]).replace(/^@/, "").toLowerCase()
  // A reserved name is a page of the app, not a handle anyone can hold, so a URL
  // pointing at one is a link to somewhere rather than an address to pay.
  if (isReservedHandle(username)) return null
  return validateUsername(username) === null ? { kind: "username", username } : null
}

// Detection runs most-specific first: every account identifier is also valid
// hex, and every principal is also a plausible username.
export function parseAddress(raw: string): ScannedAddress | null {
  // Tried on the untouched input, since stripUri discards the query tail that
  // tells a payment link apart from a bare profile link.
  const fromUrl = usernameFromUrl(raw.trim())
  if (fromUrl) return fromUrl

  const value = stripUri(raw)
  if (!value) return null

  if (isHexAccountId(value)) return { kind: "account", accountId: value.toLowerCase() }

  const icrc1 = parseIcrc1(value)
  if (icrc1) return icrc1

  try {
    return { kind: "principal", principal: Principal.fromText(value).toText() }
  } catch {
    // Not a principal, so fall through to the username test.
  }

  const username = value.replace(/^@/, "").toLowerCase()
  if (validateUsername(username) === null) return { kind: "username", username }

  return null
}

// What the transfer form puts in its recipient field for a given scan.
export function addressText(hit: ScannedAddress): string {
  switch (hit.kind) {
    case "account":
      return hit.accountId
    case "icrc1":
      return hit.owner
    case "principal":
      return hit.principal
    case "username":
      return hit.username
  }
}

// parseAddress for text a person typed or pasted, rather than scanned.
//
// The difference is the bare-username fallback, which is dropped here: it
// matches almost anything short, so a form that auto-switched on it would yank
// the user to the username tab on the first character of a principal. Every
// other form is unambiguous and complete before it parses at all -- a 64-char
// hex string, a principal with a valid checksum, an ICRC-1 address, a payment
// link -- so recognising those on the fly can only help.
export function detectTypedAddress(raw: string): ScannedAddress | null {
  const hit = parseAddress(raw)
  if (!hit) return null
  // A payment link still resolves to a username, and that one is deliberate:
  // the URL form is unmistakable.
  if (hit.kind === "username" && !/^https?:\/\//i.test(raw.trim())) return null
  return hit
}
