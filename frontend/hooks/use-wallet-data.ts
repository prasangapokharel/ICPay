"use client"

import useSWR, { useSWRConfig } from "swr"
import type { Identity } from "@dfinity/agent"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import type { DashboardData, TransactionPublic, UserPublic } from "@/services/types"
import {
  listLedgerIds,
  fetchBalances,
  fetchTokenMetadata,
  custodialSubaccount,
  ICP_LEDGER_ID,
  type TokenHolding,
} from "@/services/tokens"

// Keys are arrays so every page asking for the same data hits one cache entry.
// The principal is part of the key so switching identity cannot serve the
// previous user's balance.
const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

// getDashboard is an update call -- consensus plus an inter-canister call to the
// ledger, measured at ~6.6s -- so it is fetched once and refreshed only on
// explicit action rather than on focus or remount.
const FETCH_ONCE = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  keepPreviousData: true,
  dedupingInterval: 300_000,
} as const

export function useDashboard() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "dashboard"),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getDashboard()
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    FETCH_ONCE
  )

  return {
    data: data as DashboardData | undefined,
    error,
    isLoading,
    refresh: mutate,
  }
}

// The dashboard's balance arrives inside a ~6.6s update call. The same number is
// readable straight from the ledger as a query in about a second, so the balance
// card can settle long before the rest of the dashboard does.
export function useLiveBalance() {
  const { identity } = useAuth()
  const { data: dashboard } = useDashboard()
  const custodian = dashboard?.depositAddress.owner

  const { data } = useSWR(
    custodian && identity ? keyFor(identity, "live-balance") : null,
    async () => {
      const balances = await fetchBalances(
        [ICP_LEDGER_ID],
        custodian!,
        custodialSubaccount(identity!.getPrincipal()),
        identity
      )
      return balances.get(ICP_LEDGER_ID) ?? 0n
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  // Falls back to the dashboard's copy until the ledger query lands, so the card
  // never renders an empty balance it already knows.
  return data ?? dashboard?.icpBalance
}

export function useDepositAddress() {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWR(
    keyFor(identity, "deposit-address"),
    async () => {
      const actor = await getWalletActor(identity!)
      const [address, accountId] = await Promise.all([
        actor.getDepositAddress(),
        actor.getDepositAccountIdentifier(),
      ])
      return { address, accountId }
    },
    // A principal's deposit address is derived and never changes.
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  return { data, error, isLoading }
}

export function useTransactions(page = 0, pageSize = 20) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "transactions", String(page), String(pageSize)),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getTransactions(BigInt(page), BigInt(pageSize))
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    // History changes only when this user moves funds, and every such action
    // already calls useRefreshWallet.
    FETCH_ONCE
  )

  return {
    items: (data?.items ?? []) as TransactionPublic[],
    total: data?.total ?? 0n,
    error,
    isLoading,
    refresh: mutate,
  }
}

// Only these change when funds move. Matching every key for the principal would
// also refetch the deposit address (derived, constant) and cached username
// lookups, turning one transfer into a burst of calls.
const FUNDS_KEYS = ["dashboard", "live-balance", "transactions", "token-balances"]

export function useRefreshWallet() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return () => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    mutate(
      (key) =>
        Array.isArray(key) &&
        key[key.length - 1] === principal &&
        FUNDS_KEYS.includes(key[0] as string)
    )
  }
}

// /profile has no dashboard subscriber mounted, so invalidating that key there
// has no fetcher to revalidate with -- and since the dashboard never revalidates
// on stale, the prompt kept reading the old empty username until a hard refresh.
// Writing the record straight in also avoids a second ~6.6s getDashboard.
export function usePatchDashboardUser() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return (user: UserPublic) => {
    const key = keyFor(identity, "dashboard")
    if (!key) return
    mutate(
      key,
      (current: DashboardData | undefined) =>
        current ? { ...current, user } : current,
      { revalidate: false }
    )
  }
}

// resolveUsername is a query call, so this is safe to run while the user types.
export function useResolvedUsername(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()
  // 3 is the minimum the transfer form treats as a candidate username.
  const enabled = trimmed.length >= 3

  const { data, isLoading } = useSWR(
    enabled ? keyFor(identity, "resolve-username", trimmed) : null,
    async () => {
      const actor = await getWalletActor(identity!)
      const [principal] = await actor.resolveUsername(trimmed)
      return principal ? principal.toText() : null
    },
    // keepPreviousData would show the previous match against the new text, so
    // it is deliberately off.
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { principal: data ?? null, isLoading: enabled && isLoading }
}

// Passing an empty string matches every username, which is what fills the
// suggestion list before anyone searches.
export function useUserSearch(search: string, limit = 10) {
  const { identity } = useAuth()
  const trimmed = search.trim().toLowerCase()
  const { data: dashboard } = useDashboard()

  const { data, isLoading } = useSWR(
    keyFor(identity, "search-users", trimmed),
    async () => {
      const actor = await getWalletActor(identity!)
      const users = await actor.searchUsers(trimmed)
      return users
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  // Compared by username, not id: UserPublic.id is a UUID and searchUsers
  // returns no principal, so the username is the only shared identifier.
  const ownUsername = dashboard?.user.username?.[0]

  return {
    users: (data ?? [])
      // Only usernamed accounts are addressable, and tipping yourself is not a
      // thing, so neither belongs in the list.
      .filter((u) => u.username.length > 0 && u.username[0] !== ownUsername)
      .slice(0, limit),
    isLoading,
  }
}

// Read straight from each ICRC-1 ledger, never through the wallet canister:
// icrc1_balance_of is a query, so the sweep costs no cycles and adds no backend
// load.
export function useTokenHoldings() {
  const { identity } = useAuth()
  const { data: dashboard } = useDashboard()
  const custodian = dashboard?.depositAddress.owner

  // Phase 1 -- balances only, across every known ledger. Discovery is folded in
  // so the whole sweep is one cache entry.
  const { data: balances, isLoading: loadingBalances } = useSWR(
    custodian && identity ? keyFor(identity, "token-balances") : null,
    async () => {
      const ledgerIds = await listLedgerIds(identity)
      const owner = custodian!
      const subaccount = custodialSubaccount(identity!.getPrincipal())
      return await fetchBalances(ledgerIds, owner, subaccount, identity)
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  // Phase 2 -- metadata for held tokens only, keyed by the held ledger ids so it
  // refetches when a new token appears rather than on every balance change.
  const heldIds = balances ? [...balances.keys()].sort() : []
  const { data: metadata, isLoading: loadingMetadata } = useSWR(
    heldIds.length ? (["token-metadata", heldIds.join(",")] as const) : null,
    async () => {
      const entries = await Promise.all(heldIds.map((id) => fetchTokenMetadata(id, identity)))
      return new Map(entries.flatMap((m) => (m ? [[m.ledgerId, m] as const] : [])))
    },
    // Token metadata is immutable in practice.
    { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 3_600_000 }
  )

  const holdings: TokenHolding[] = heldIds.flatMap((ledgerId) => {
    const meta = metadata?.get(ledgerId)
    // A held token whose metadata has not landed is withheld rather than shown
    // as "UNKNOWN", so the list never flashes placeholder symbols.
    if (!meta) return []
    return [{ ...meta, balance: balances!.get(ledgerId)! }]
  })

  return {
    // ICP first; the rest by balance so the biggest holding leads.
    holdings: holdings.sort((a, b) => {
      if (a.ledgerId === ICP_LEDGER_ID) return -1
      if (b.ledgerId === ICP_LEDGER_ID) return 1
      return a.symbol.localeCompare(b.symbol)
    }),
    isLoading: loadingBalances || (heldIds.length > 0 && loadingMetadata && !metadata),
  }
}
