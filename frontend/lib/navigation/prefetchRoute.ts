import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { preload } from "swr"
import { searchUsers } from "@/services/profile/profile"
import { bucketListKey } from "@/lib/bucket/cacheKeys"
import { listBuckets } from "@/services/bucket/bucket"
import {
  custodialSubaccount,
  fetchBalances,
  ICP_LEDGER_ID,
} from "@/services/tokens"
import {
  loadDashboard,
  resolveDeposit,
  resolveProfile,
  walletKey,
} from "@/lib/wallet/walletCache"
import { getCachedLedgerIds } from "@/lib/wallet/ledgerIdsCache"

async function custodianForPrefetch(identity: Identity) {
  const deposit = await resolveDeposit(identity)
  return deposit.address.owner
}

export function prefetchAppRoute(href: string, identity: Identity | undefined) {
  if (!identity) return

  const path = href.split("?")[0]

  switch (path) {
    case "/":
      preload(walletKey(identity, "dashboard")!, () => loadDashboard(identity))
      preload(walletKey(identity, "token-balance", ICP_LEDGER_ID)!, async () => {
        const owner = await custodianForPrefetch(identity)
        const balances = await fetchBalances(
          [ICP_LEDGER_ID],
          owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
        return balances.get(ICP_LEDGER_ID) ?? 0n
      })
      break
    case "/icpverse":
      preload(walletKey(identity, "search-users", "")!, () => searchUsers(identity, ""))
      break
    case "/bucket":
      preload(bucketListKey(identity), () => listBuckets(identity))
      break
    case "/channels":
      preload(walletKey(identity, "community-public")!, () =>
        import("@/services/community/community").then((m) => m.listPublicCommunityChannels(identity))
      )
      preload(walletKey(identity, "community-mine")!, () =>
        import("@/services/community/community").then((m) => m.listMyCommunityChannels(identity))
      )
      break
    case "/transfer":
      preload(walletKey(identity, "token-balance", ICP_LEDGER_ID)!, async () => {
        const owner = await custodianForPrefetch(identity)
        const balances = await fetchBalances(
          [ICP_LEDGER_ID],
          owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
        return balances.get(ICP_LEDGER_ID) ?? 0n
      })
      break
    case "/wallet":
      preload(walletKey(identity, "deposit-address")!, () => resolveDeposit(identity))
      preload(walletKey(identity, "token-balances")!, async () => {
        const owner = await custodianForPrefetch(identity)
        const ledgerIds = await getCachedLedgerIds(identity)
        return fetchBalances(
          ledgerIds,
          owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
      })
      break
    case "/settings":
      preload(walletKey(identity, "profile")!, () => resolveProfile(identity))
      break
    default:
      if (path.startsWith("/icpverse/")) {
        const name = path.slice("/icpverse/".length).toLowerCase()
        if (name.length >= 1) {
          preload(["resolve-username", name] as const, async () => {
            const { resolveUsername } = await import("@/services/profile/profile")
            return resolveUsername(identity, name)
          })
        }
      } else if (path.startsWith("/token/")) {
        const rest = path.slice("/token/".length)
        const ledgerId = rest.endsWith("/deposit") ? rest.slice(0, -"/deposit".length) : rest
        if (ledgerId && ledgerId !== "token") {
          preload(walletKey(identity, "deposit-address")!, () => resolveDeposit(identity))
          preload(walletKey(identity, "token-balance", ledgerId)!, async () => {
            const owner = await custodianForPrefetch(identity)
            const balances = await fetchBalances(
              [ledgerId],
              owner,
              custodialSubaccount(identity.getPrincipal()),
              identity
            )
            return balances.get(ledgerId) ?? 0n
          })
        }
      }
      break
  }
}

export function prefetchUsernameProfile(username: string, identity: Identity | undefined) {
  if (!identity) return
  const name = username.trim().toLowerCase()
  if (name.length < 1) return
  preload(["resolve-username", name] as const, async () => {
    const { resolveUsername } = await import("@/services/profile/profile")
    return resolveUsername(identity, name)
  })
}

export function prefetchPrincipalStats(owner: string, custodian: string, identity: Identity) {
  preload(["account-stats", owner, custodian] as const, async () => {
    const { fetchAccountStats } = await import("@/services/account/account")
    return fetchAccountStats(custodian, custodialSubaccount(Principal.fromText(owner)), identity)
  })
}
