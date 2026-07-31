"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import type { Identity } from "@dfinity/agent"
import { login as iiLogin, logout as iiLogout } from "@/services/auth/auth"
import { getWalletActor, clearActorCache } from "@/services/wallet"

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
  const router = useRouter()
  const { mutate } = useSWRConfig()

  useEffect(() => {
    async function init() {
      try {
        const { AuthClient } = await import("@dfinity/auth-client")
        const authClient = await AuthClient.create()
        const id = authClient.getIdentity()
        if (id.getPrincipal().isAnonymous()) return

        // A stored delegation can be unusable against the current replica --
        // expired, or issued by a different Internet Identity than the one this
        // build talks to. Both surface as an opaque "Invalid delegation" on the
        // first real call, so probe with a cheap query and drop it if it fails.
        try {
          const actor = await getWalletActor(id)
          // login() is idempotent and returns the existing record when there is
          // one. Calling it on restore (not just on connect) re-creates the user
          // if the canister lost it -- otherwise a still-valid delegation leaves
          // the UI signed in against a canister with no record, where reads off
          // the ledger succeed but every user-scoped write fails "User not found".
          await actor.login()
          setIdentity(id)
        } catch (e) {
          console.warn("Stored delegation rejected, signing out:", e)
          await authClient.logout()
          clearActorCache()
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
        const actor = await getWalletActor(id)
        await actor.login()
      } catch (e) {
        console.error("Backend login error:", e)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await iiLogout()
    clearActorCache()
    // The SWR cache is module-global and outlives the identity, so balances and
    // transactions from this session would still be readable after signing out.
    // Drop every entry and disable revalidation so nothing refetches on the way
    // to /login while the delegation is already gone.
    await mutate(() => true, undefined, { revalidate: false })
    setIdentity(undefined)
    router.replace("/login")
  }, [mutate, router])

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
