import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { fetchBalances, mergeWalletLedgerIds } from "@/services/tokens"

export async function fetchWalletBalances(
  registryIds: string[],
  customLedgerIds: string[],
  owner: Principal,
  subaccount: Uint8Array,
  identity?: Identity
): Promise<Map<string, bigint>> {
  return fetchBalances(
    mergeWalletLedgerIds(registryIds, customLedgerIds),
    owner,
    subaccount,
    identity
  )
}
