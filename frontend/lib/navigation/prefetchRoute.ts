import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { preload } from "swr"
import { getDashboard } from "@/services/dashboard/dashboard"
import { getDepositAddress } from "@/services/deposit/deposit"
import { searchUsers } from "@/services/profile/profile"
import { bucketListKey } from "@/lib/bucket/cacheKeys"
import { listBuckets } from "@/services/bucket/bucket"
import {
  custodialSubaccount,
  fetchBalances,
  ICP_LEDGER_ID,
  listLedgerIds,
} from "@/services/tokens"

function swrKey(identity: Identity, ...parts: string[]) {
  return [...parts, identity.getPrincipal().toText()] as const
}

export function prefetchAppRoute(href: string, identity: Identity | undefined) {
  if (!identity) return

  const path = href.split("?")[0]

  switch (path) {
    case "/":
      preload(swrKey(identity, "dashboard"), () => getDashboard(identity))
      preload(swrKey(identity, "token-balance", ICP_LEDGER_ID), async () => {
        const deposit = await getDepositAddress(identity)
        const balances = await fetchBalances(
          [ICP_LEDGER_ID],
          deposit.address.owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
        return balances.get(ICP_LEDGER_ID) ?? 0n
      })
      break
    case "/icpverse":
      preload(swrKey(identity, "search-users", ""), () => searchUsers(identity, ""))
      break
    case "/bucket":
      preload(bucketListKey(identity), () => listBuckets(identity))
      break
    case "/channels":
      preload(swrKey(identity, "community-public"), () =>
        import("@/services/community/community").then((m) => m.listPublicCommunityChannels(identity))
      )
      preload(swrKey(identity, "community-mine"), () =>
        import("@/services/community/community").then((m) => m.listMyCommunityChannels(identity))
      )
      break
    case "/transfer":
      preload(swrKey(identity, "token-balance", ICP_LEDGER_ID), async () => {
        const deposit = await getDepositAddress(identity)
        const balances = await fetchBalances(
          [ICP_LEDGER_ID],
          deposit.address.owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
        return balances.get(ICP_LEDGER_ID) ?? 0n
      })
      break
    case "/wallet":
      preload(swrKey(identity, "deposit-address"), () => getDepositAddress(identity))
      preload(swrKey(identity, "token-balances"), async () => {
        const deposit = await getDepositAddress(identity)
        const ledgerIds = await listLedgerIds(identity)
        return fetchBalances(
          ledgerIds,
          deposit.address.owner,
          custodialSubaccount(identity.getPrincipal()),
          identity
        )
      })
      break
    case "/settings":
      preload(swrKey(identity, "profile"), async () => {
        const { getProfile } = await import("@/services/profile/profile")
        return getProfile(identity)
      })
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
        const ledgerId = path.slice("/token/".length)
        if (ledgerId) {
          preload(swrKey(identity, "token-balance", ledgerId), async () => {
            const deposit = await getDepositAddress(identity)
            const balances = await fetchBalances(
              [ledgerId],
              deposit.address.owner,
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
