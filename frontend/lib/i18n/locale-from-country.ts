import { LOCALES, type Locale } from "@/language/config"

const PRIMARY = Object.fromEntries(
  LOCALES.map((locale) => [locale.country, locale.code])
) as Record<string, Locale>

const EXTRA: Record<string, Locale> = {
  GB: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  CA: "en",
  ZA: "en",
  SG: "en",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  PR: "es",
  BE: "fr",
  LU: "fr",
  MC: "fr",
  AT: "de",
  LI: "de",
  CH: "de",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  BY: "ru",
  KZ: "ru",
  KG: "ru",
  AE: "ar",
  SA: "ar",
  SY: "ar",
  JO: "ar",
  LB: "ar",
  KW: "ar",
  BH: "ar",
  QA: "ar",
  OM: "ar",
  YE: "ar",
  EG: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LY: "ar",
  SD: "ar",
  MY: "id",
  BN: "id",
  LA: "th",
  MM: "th",
}

export function localeFromCountryCode(countryCode: string | null | undefined): Locale | null {
  if (!countryCode) return null
  const code = countryCode.toUpperCase()
  return EXTRA[code] ?? PRIMARY[code] ?? null
}
