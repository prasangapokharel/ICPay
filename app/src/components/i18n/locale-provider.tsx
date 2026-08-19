import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import en from '@/language/en/common.json'
import hi from '@/language/hi/common.json'
import zh from '@/language/zh/common.json'
import ja from '@/language/ja/common.json'
import ko from '@/language/ko/common.json'
import es from '@/language/es/common.json'
import fr from '@/language/fr/common.json'
import de from '@/language/de/common.json'
import pt from '@/language/pt/common.json'
import ru from '@/language/ru/common.json'
import { DEFAULT_LOCALE, STORAGE_KEY, isLocale, type Locale } from '@/language/config'
import { getItem, setItem, subscribeKv } from '@/services/storage/kv'

const MESSAGES: Record<Locale, typeof en> = { en, hi, zh, ja, ko, es, fr, de, pt, ru }

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: typeof en
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  messages: en,
})

function getSnapshot(): Locale {
  const stored = getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeKv, getSnapshot, () => DEFAULT_LOCALE)
  const setLocale = useCallback((next: Locale) => {
    setItem(STORAGE_KEY, next)
  }, [])
  const messages = MESSAGES[locale]
  const value = useMemo(() => ({ locale, setLocale, messages }), [locale, setLocale, messages])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextType {
  return useContext(LocaleContext)
}

type Vars = Record<string, string | number>

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

function lookup(messages: unknown, path: string): string {
  const parts = path.split('.')
  let current: unknown = messages
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

export function useTranslations(namespace?: string) {
  const { messages } = useLocale()
  return (key: string, vars?: Vars): string => {
    const path = namespace ? `${namespace}.${key}` : key
    return interpolate(lookup(messages, path), vars)
  }
}
