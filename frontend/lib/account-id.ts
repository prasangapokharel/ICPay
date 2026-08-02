import type { Principal } from "@dfinity/principal"
import { sha224 } from "@noble/hashes/sha2"

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
})()

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const b of bytes) crc = CRC32_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function base32NoPad(bytes: Uint8Array): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567"
  let bits = 0
  let value = 0
  let out = ""
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31]
  return out
}

function normalize(subaccount?: Uint8Array | number[]): Uint8Array | undefined {
  if (!subaccount) return undefined
  const sub = subaccount instanceof Uint8Array ? subaccount : new Uint8Array(subaccount)
  return sub.some((b) => b !== 0) ? sub : undefined
}

/**
 * ICRC-1 textual encoding. A non-default subaccount is appended as
 * `<principal>-<checksum>.<subaccount>` — dropping it would make funds
 * unattributable, so the full form must always be shown to the user.
 */
export function icrc1Account(owner: Principal, subaccount?: Uint8Array | number[]): string {
  const sub = normalize(subaccount)
  if (!sub) return owner.toText()

  const principalBytes = owner.toUint8Array()
  const payload = new Uint8Array(principalBytes.length + sub.length)
  payload.set(principalBytes, 0)
  payload.set(sub, principalBytes.length)

  const checksumBytes = new Uint8Array(4)
  new DataView(checksumBytes.buffer).setUint32(0, crc32(payload), false)
  const checksum = base32NoPad(checksumBytes)

  const trimmed = toHex(sub).replace(/^0+/, "")
  return `${owner.toText()}-${checksum}.${trimmed}`
}

const ACCOUNT_ID_DOMAIN = new TextEncoder().encode("\x0Aaccount-id")

/**
 * The legacy account identifier for the same account: crc32 ++ sha224 over a
 * domain-separated owner and subaccount. Mirrors Principal.toLedgerAccount on
 * the canister side, verified byte-for-byte against getDepositAccountIdentifier.
 *
 * Derived rather than fetched because that endpoint is scoped to its caller, so
 * a visitor looking at someone else's profile cannot ask for it.
 */
export function accountIdentifier(owner: Principal, subaccount?: Uint8Array | number[]): string {
  const sub = subaccount
    ? subaccount instanceof Uint8Array
      ? subaccount
      : new Uint8Array(subaccount)
    : new Uint8Array(32)

  const ownerBytes = owner.toUint8Array()
  const payload = new Uint8Array(ACCOUNT_ID_DOMAIN.length + ownerBytes.length + sub.length)
  payload.set(ACCOUNT_ID_DOMAIN, 0)
  payload.set(ownerBytes, ACCOUNT_ID_DOMAIN.length)
  payload.set(sub, ACCOUNT_ID_DOMAIN.length + ownerBytes.length)

  const hash = sha224(payload)
  const out = new Uint8Array(4 + hash.length)
  new DataView(out.buffer).setUint32(0, crc32(hash), false)
  out.set(hash, 4)
  return toHex(out)
}
