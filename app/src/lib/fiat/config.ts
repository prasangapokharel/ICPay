// The single source of truth for what currencies exist. Adding one means
// appending here -- nothing else. Frankfurter v2 can quote any of its 201
// currencies, so the list is only what the UI offers, not what the API knows.
export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "NPR", label: "Nepalese Rupee", symbol: "रू" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", label: "South Korean Won", symbol: "₩" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
] as const

export type FiatCurrency = (typeof CURRENCIES)[number]["code"]

export const DEFAULT_CURRENCY: FiatCurrency = "USD"

export const STORAGE_KEY = "icpay:fiat"

export function isCurrency(value: string | null): value is FiatCurrency {
  return !!value && CURRENCIES.some((c) => c.code === value)
}
