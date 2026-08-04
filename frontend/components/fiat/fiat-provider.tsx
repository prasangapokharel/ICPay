"use client"

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react"
import { DEFAULT_CURRENCY, STORAGE_KEY, isCurrency, type FiatCurrency } from "@/lib/fiat/config"

type FiatContextType = {
  currency: FiatCurrency
  setCurrency: (currency: FiatCurrency) => void
}

const FiatContext = createContext<FiatContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
})

// Same store pattern as the locale provider: reads localStorage without an
// effect so the first client paint already shows the stored currency.
const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  window.addEventListener("storage", fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener("storage", fn)
  }
}

function getSnapshot(): FiatCurrency {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isCurrency(stored) ? stored : DEFAULT_CURRENCY
}

function getServerSnapshot(): FiatCurrency {
  return DEFAULT_CURRENCY
}

export function FiatProvider({ children }: { children: ReactNode }) {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setCurrency = useCallback((next: FiatCurrency) => {
    localStorage.setItem(STORAGE_KEY, next)
    listeners.forEach((fn) => fn())
  }, [])

  return (
    <FiatContext.Provider value={{ currency, setCurrency }}>
      {children}
    </FiatContext.Provider>
  )
}

export function useFiatCurrency(): FiatContextType {
  return useContext(FiatContext)
}
