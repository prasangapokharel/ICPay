"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Identity } from "@dfinity/agent"
import {
  login as iiLogin,
  logout as iiLogout,
  createAuthClient,
  openBackendSession,
  discardRejectedSession,
} from "@/services/auth/auth"

type AuthContextType = {
  identity: Identity | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  identity: undefined,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const authClient = await createAuthClient()
        const id = authClient.getIdentity()
        if (id.getPrincipal().isAnonymous()) return

        try {
          await openBackendSession(id)
          setIdentity(id)
        } catch (e) {
          console.warn("Stored delegation rejected, signing out:", e)
          await discardRejectedSession()
        }
      } catch (e) {
        console.error("Auth init error:", e)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async () => {
    const id = await iiLogin()
    if (id) {
      setIdentity(id)
      try {
        await openBackendSession(id)
      } catch (e) {
        console.error("Backend login error:", e)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await iiLogout()
    // A full document load rather than router.replace: the SWR cache, the
    // wallet actor and the auth client are all module-level singletons that
    // would otherwise outlive the identity and stay readable after sign-out.
    window.location.replace("/login")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        identity,
        isAuthenticated: !!identity,
        isLoading,
        login,
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
