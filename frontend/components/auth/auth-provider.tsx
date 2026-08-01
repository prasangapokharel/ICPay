"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import type { Identity } from "@dfinity/agent"
import { login as iiLogin, logout as iiLogout, createAuthClient } from "@/services/auth/auth"
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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    ),
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  useEffect(() => {
    async function init() {
      try {
        const authClient = await createAuthClient()
        const id = authClient.getIdentity()
        if (id.getPrincipal().isAnonymous()) return

        // A stored delegation can be unusable against the current replica --
        // expired, or issued by a different Internet Identity than this build
        // talks to. Both surface as an opaque "Invalid delegation" on the first
        // real call, so probe with a cheap query and drop it if it fails.
        try {
          const actor = await getWalletActor(id)
          // login() is idempotent and returns the existing record when there is
          // one. Calling it on restore re-creates the user if the canister lost
          // it -- otherwise a still-valid delegation leaves the UI signed in
          // against a canister with no record, where reads succeed but every
          // user-scoped write fails "User not found". Bounded because a hung
          // boundary node would otherwise leave the app stuck behind a spinner.
          await withTimeout(actor.login(), 20_000)
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
        await withTimeout(actor.login(), 20_000)
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
