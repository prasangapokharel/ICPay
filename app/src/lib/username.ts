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

// Keys, not display text: the UI resolves them under buyUsername.tiers.
export type Tier = {
  labelKey: "ultra" | "premium" | "standard" | "basic"
  price: bigint
  rangeKey: "ultraRange" | "premiumRange" | "standardRange" | "basicRange"
  // The range this tier covers. Carried as data so the pricing table can ask
  // premium-tick which badges the row reaches, rather than restating the badge
  // thresholds next to the prices where the two could drift.
  minLength: number
  maxLength: number
}

export const TIERS: Tier[] = [
  { labelKey: "ultra", price: PRICE_ULTRA_PREMIUM, rangeKey: "ultraRange", minLength: USERNAME_MIN_LENGTH, maxLength: 3 },
  { labelKey: "premium", price: PRICE_PREMIUM, rangeKey: "premiumRange", minLength: 4, maxLength: 4 },
  { labelKey: "standard", price: PRICE_STANDARD, rangeKey: "standardRange", minLength: 5, maxLength: 5 },
  { labelKey: "basic", price: PRICE_BASIC, rangeKey: "basicRange", minLength: 6, maxLength: USERNAME_MAX_LENGTH },
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

export type UsernameError = "required" | "tooLong" | "invalidChars" | "notFree"

// Shape only -- says nothing about whether the name is free. Matches
// UsernameValidator.validate, the rule the paid path uses.
export function validateUsername(name: string): UsernameError | null {
  if (name.length < USERNAME_MIN_LENGTH) return "required"
  if (name.length > USERNAME_MAX_LENGTH) return "tooLong"
  if (!VALID_CHARS.test(name)) return "invalidChars"
  return null
}

// Matches UsernameValidator.validateFreeClaim: the stricter rule that keeps
// short names as paid inventory.
export function validateFreeUsername(name: string): UsernameError | null {
  const err = validateUsername(name)
  if (err) return err
  if (name.length < USERNAME_FREE_MIN_LENGTH) return "notFree"
  return null
}
