import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { DEFAULT_CURRENCY, STORAGE_KEY, isCurrency, type FiatCurrency } from '@/lib/fiat/config'
import { getItem, setItem, subscribeKv } from '@/services/storage/kv'

type FiatContextType = {
  currency: FiatCurrency
  setCurrency: (currency: FiatCurrency) => void
}

const FiatContext = createContext<FiatContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
})

function getSnapshot(): FiatCurrency {
  const stored = getItem(STORAGE_KEY)
  return isCurrency(stored) ? stored : DEFAULT_CURRENCY
}

export function FiatProvider({ children }: { children: ReactNode }) {
  const currency = useSyncExternalStore(subscribeKv, getSnapshot, () => DEFAULT_CURRENCY)
  const setCurrency = useCallback((next: FiatCurrency) => {
    setItem(STORAGE_KEY, next)
  }, [])
  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency])
  return <FiatContext.Provider value={value}>{children}</FiatContext.Provider>
}

export function useFiatCurrency(): FiatContextType {
  return useContext(FiatContext)
}
