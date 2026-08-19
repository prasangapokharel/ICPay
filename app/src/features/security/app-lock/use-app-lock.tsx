import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { isPayVerified, isSendLockEnabled, setPayVerified, setSendLockEnabled } from '@/features/security/app-lock/app-lock.service'

type AppLockContextType = {
  onSend: boolean
  verified: boolean
  setOnSend: (value: boolean) => void
  markVerified: () => void
}

const AppLockContext = createContext<AppLockContextType | null>(null)

export function AppLockProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [onSend, setOnSendState] = useState(isSendLockEnabled)
  const [verified, setVerified] = useState(isPayVerified)

  useEffect(() => {
    if (isAuthenticated) return
    setPayVerified(false)
    setVerified(false)
  }, [isAuthenticated])

  const setOnSend = useCallback((value: boolean) => {
    setSendLockEnabled(value)
    setOnSendState(value)
  }, [])

  const markVerified = useCallback(() => {
    setPayVerified(true)
    setVerified(true)
  }, [])

  const value = useMemo(
    () => ({ onSend, verified, setOnSend, markVerified }),
    [onSend, verified, setOnSend, markVerified],
  )

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
}

export function useAppLock(): AppLockContextType {
  const ctx = useContext(AppLockContext)
  if (!ctx) throw new Error('useAppLock')
  return ctx
}
