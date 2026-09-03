"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import {
  login as iiLogin,
  logout as iiLogout,
  createAuthClient,
  openBackendSession,
  discardRejectedSession,
  type LoginOptions,
} from "@/services/auth/auth"
import { playLoginChime } from "@/lib/ui/successChime"

type AuthContextType = {
  identity: Identity | undefined
  isAuthenticated: boolean
  isLoading: boolean
  login: (options?: LoginOptions) => Promise<void>
  acceptIdentity: (identity: Identity) => Promise<void>
  logout: () => Promise<void>
}

// Keyed by principal so a second account still gets its one chime, and so
// clearing site data resets it the same way it resets the session.
const SOUND_KEY = "icpay:login-sound:"

function playLoginChimeOnce(principal: string) {
  const key = SOUND_KEY + principal
  if (localStorage.getItem(key)) return
  // Written before playback, not after: a browser that blocks the sound must
  // not leave the flag unset and retry on every future sign-in.
  localStorage.setItem(key, "1")
  playLoginChime()
}

const AuthContext = createContext<AuthContextType>({
  identity: undefined,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  acceptIdentity: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const authClient = await createAuthClient()
        if (!authClient.isAuthenticated()) return
        const id = await authClient.getIdentity()

        try {
          await openBackendSession(id)
          setIdentity(id)
        } catch {
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

  const acceptIdentity = useCallback(async (id: Identity) => {
    try {
      await openBackendSession(id)
    } catch (e) {
      console.error("Backend login error:", e)
    }
    playLoginChimeOnce(id.getPrincipal().toText())
    setIdentity(id)
  }, [])

  const login = useCallback((options?: LoginOptions) => {
    return iiLogin(options).then((id) => {
      if (!id) return
      return acceptIdentity(id)
    })
  }, [acceptIdentity])

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
        acceptIdentity,
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
