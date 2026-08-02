// Mirrors backend Config and UsernameValidator. Duplicated deliberately: the
// input validates on every keystroke, and a canister call per character would
// be both slow and pointless when the rule is pure arithmetic. The backend
// still enforces all of this -- this copy only decides what the UI shows.
export const USERNAME_MIN_LENGTH = 1
export const USERNAME_MAX_LENGTH = 8
export const USERNAME_FREE_MIN_LENGTH = 5

const E8S = 100_000_000n

export const PRICE_ULTRA_PREMIUM = 10n * E8S
export const PRICE_PREMIUM = 5n * E8S
export const PRICE_STANDARD = 2n * E8S
export const PRICE_BASIC = 1n * E8S

export type Tier = {
  label: string
  price: bigint
  range: string
}

export const TIERS: Tier[] = [
  { label: "Ultra premium", price: PRICE_ULTRA_PREMIUM, range: "1-3 characters" },
  { label: "Premium", price: PRICE_PREMIUM, range: "4 characters" },
  { label: "Standard", price: PRICE_STANDARD, range: "5 characters" },
  { label: "Basic", price: PRICE_BASIC, range: "6-8 characters" },
]

export function priceFor(name: string): bigint {
  const len = name.length
  if (len <= 3) return PRICE_ULTRA_PREMIUM
  if (len === 4) return PRICE_PREMIUM
  if (len === 5) return PRICE_STANDARD
  return PRICE_BASIC
}

export function tierFor(name: string): Tier {
  const price = priceFor(name)
  return TIERS.find((t) => t.price === price) ?? TIERS[3]
}

const VALID_CHARS = /^[a-zA-Z0-9_]+$/

// Shape only -- says nothing about whether the name is free. Matches
// UsernameValidator.validate, the rule the paid path uses.
export function validateUsername(name: string): string | null {
  if (name.length < USERNAME_MIN_LENGTH) return "Enter a username"
  if (name.length > USERNAME_MAX_LENGTH) return `Maximum length is ${USERNAME_MAX_LENGTH} characters`
  if (!VALID_CHARS.test(name)) return "Letters, numbers and underscore only"
  return null
}

// Matches UsernameValidator.validateFreeClaim: the stricter rule that keeps
// short names as paid inventory.
export function validateFreeUsername(name: string): string | null {
  const err = validateUsername(name)
  if (err) return err
  if (name.length < USERNAME_FREE_MIN_LENGTH) {
    return `Free usernames need ${USERNAME_FREE_MIN_LENGTH}+ characters. Shorter names can be bought.`
  }
  return null
}
