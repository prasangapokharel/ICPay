import type { Locale } from "@/language/config"
import { localeFromCountryCode } from "@/lib/i18n/locale-from-country"

const IPQUERY_URL = "https://api.ipquery.io/?format=json"

type IpQueryResponse = {
  location?: { country_code?: string }
}

export async function detectLocaleFromIp(): Promise<Locale | null> {
  try {
    const res = await fetch(IPQUERY_URL, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const data = (await res.json()) as IpQueryResponse
    return localeFromCountryCode(data.location?.country_code)
  } catch {
    return null
  }
}
