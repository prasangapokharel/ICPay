"use client"

import useSWR from "swr"
import useSWRImmutable from "swr/immutable"
import type { Identity } from "@icp-sdk/core/agent"
import { useAuth } from "@/components/auth/auth-provider"
import { usePageVisible } from "@/hooks/live/usePageVisible"
import type { TokenPublic } from "@/services/types"
import {
  isSymbolAvailable,
  getLaunchFee,
  isLaunchReady,
  getMyTokens,
  getTokenById,
} from "@/services/launch/launch"
import { normalizeSymbol, validateSymbol } from "@/lib/token/launch"

// Same convention as use-wallet-data: the principal is the last key part, so a
// switched identity cannot be served another account's launches.
const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

// Every call in this file is a query, which the IC does not bill, so these are
// far cheaper to revalidate than anything in use-wallet-data.
const QUERY = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  errorRetryCount: 3,
} as const

// Asked only of symbols that already pass the shape rules, so a half-typed
// symbol does not produce a stream of confident-looking "unavailable".
export function useSymbolAvailability(symbol: string) {
  const { identity } = useAuth()
  const normalized = normalizeSymbol(symbol)
  const wellFormed = normalized !== "" && validateSymbol(normalized) === null

  const { data, isLoading } = useSWR(
    wellFormed ? keyFor(identity, "symbol-available", normalized) : null,
    () => isSymbolAvailable(identity, normalized),
    {
      ...QUERY,
      // The previous symbol's verdict shown against new text reads as a
      // confident answer about the wrong symbol.
      keepPreviousData: false,
      dedupingInterval: 30_000,
    }
  )

  return { available: data ?? null, isLoading: wellFormed && isLoading }
}

// Immutable: the fee is a compiled-in constant, so one read per session is the
// whole truth until the canister is redeployed.
export function useLaunchFee() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWRImmutable(keyFor(identity, "launch-fee"), () =>
    getLaunchFee(identity)
  )

  return { fee: data, isLoading }
}

// Not immutable: readiness flips when the operator seals a wasm, and a form
// enabled against a stale true would take payment for a launch that has nothing
// to install.
export function useLaunchReady() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR(
    keyFor(identity, "launch-ready"),
    () => isLaunchReady(identity),
    { ...QUERY, dedupingInterval: 60_000 }
  )

  return { ready: data, isLoading }
}

export function useMyTokens(limit = 50) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "my-tokens", String(limit)),
    () => getMyTokens(identity, limit, 0),
    { ...QUERY, keepPreviousData: true }
  )

  return { tokens: (data ?? []) as TokenPublic[], error, isLoading, refresh: mutate }
}

// Polled while pending. A launch is several inter-canister calls long and can
// still be running after the creator has navigated away, so without the interval
// the detail page would read "creating" until a manual reload.
export function useToken(id: string | null) {
  const { identity } = useAuth()
  const pageVisible = usePageVisible()

  const { data, error, isLoading, mutate } = useSWR(
    id ? keyFor(identity, "token", id) : null,
    () => getTokenById(identity, id!),
    {
      ...QUERY,
      keepPreviousData: true,
      refreshInterval: (token) =>
        pageVisible && token && "pending" in token.status ? 5_000 : 0,
    }
  )

  return { token: data ?? null, error, isLoading, refresh: mutate }
}
