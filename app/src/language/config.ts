// The single source of truth for what languages exist. Adding one means
// appending here and creating language/<code>/common.json -- nothing else.
export const LOCALES = [
  { code: "en", label: "English", country: "US" },
  { code: "hi", label: "हिन्दी", country: "IN" },
  { code: "zh", label: "简体中文", country: "CN" },
  { code: "ja", label: "日本語", country: "JP" },
  { code: "ko", label: "한국어", country: "KR" },
  { code: "es", label: "Español", country: "ES" },
  { code: "fr", label: "Français", country: "FR" },
  { code: "de", label: "Deutsch", country: "DE" },
  { code: "pt", label: "Português", country: "BR" },
  { code: "ru", label: "Русский", country: "RU" },
] as const

export type Locale = (typeof LOCALES)[number]["code"]

export const DEFAULT_LOCALE: Locale = "en"

export const STORAGE_KEY = "icpay:locale"

export function isLocale(value: string | null): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value)
}
