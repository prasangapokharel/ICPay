"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { NextIntlClientProvider } from "next-intl"
import { DEFAULT_LOCALE, STORAGE_KEY, isLocale, type Locale } from "@/language/config"
import en from "@/language/en/common.json"
import hi from "@/language/hi/common.json"
import zh from "@/language/zh/common.json"
import ja from "@/language/ja/common.json"
import ko from "@/language/ko/common.json"
import es from "@/language/es/common.json"
import fr from "@/language/fr/common.json"
import de from "@/language/de/common.json"
import pt from "@/language/pt/common.json"
import ru from "@/language/ru/common.json"
import ar from "@/language/ar/common.json"
import ne from "@/language/ne/common.json"
import tl from "@/language/tl/common.json"
import id from "@/language/id/common.json"
import vi from "@/language/vi/common.json"
import th from "@/language/th/common.json"
import tr from "@/language/tr/common.json"

// Statically imported rather than dynamic import(): the catalogs are ~3 KB each
// and gzip to far less, so bundling all of them costs less than the loading
// state a fetch-per-locale would need -- and a static export has no server to
// stream them from. Revisit if the catalogs grow past a few hundred keys.
const MESSAGES: Record<Locale, typeof en> = {
  en,
  hi,
  zh,
  ja,
  ko,
  es,
  fr,
  de,
  pt,
  ru,
  ar,
  ne,
  tl,
  id,
  vi,
  th,
  tr,
}

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

// A module-level store rather than useState in the provider: useSyncExternalStore
// reads localStorage without an effect, which keeps the first client paint on the
// stored locale instead of flashing English.
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  // Other tabs write the same key, so a switch in one propagates to the rest.
  window.addEventListener("storage", fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", fn)
  }
}

function getSnapshot(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : DEFAULT_LOCALE
}

// The server render and the hydration pass have no localStorage, so both must
// agree on English or React discards the tree as a hydration mismatch.
function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

function subscribeTimeZone() {
  return () => {}
}

function getTimeZoneSnapshot() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function getServerTimeZoneSnapshot() {
  return "UTC"
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const timeZone = useSyncExternalStore(
    subscribeTimeZone,
    getTimeZoneSnapshot,
    getServerTimeZoneSnapshot
  )

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next)
    listeners.forEach((fn) => fn())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale]}
        timeZone={timeZone}
        now={undefined}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextType {
  return useContext(LocaleContext)
}
