import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Identity } from '@icp-sdk/core/agent'
import {
  discardRejectedSession,
  logout as iiLogout,
  openBackendSession,
  restoreIdentity,
} from '@/services/auth/auth'

type AuthContextType = {
  identity: Identity | undefined
  isAuthenticated: boolean
  isLoading: boolean
  completeLogin: (identity: Identity) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  identity: undefined,
  isAuthenticated: false,
  isLoading: true,
  completeLogin: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const id = await restoreIdentity()
        if (!id || id.getPrincipal().isAnonymous()) return
        try {
          await openBackendSession(id)
          setIdentity(id)
        } catch {
          await discardRejectedSession()
        }
      } finally {
        setIsLoading(false)
      }
    }
    void init()
  }, [])

  const completeLogin = useCallback(async (id: Identity) => {
    await openBackendSession(id)
    setIdentity(id)
  }, [])

  const logout = useCallback(async () => {
    await iiLogout()
    setIdentity(undefined)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        identity,
        isAuthenticated: !!identity,
        isLoading,
        completeLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
