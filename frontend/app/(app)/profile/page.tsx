"use client"

import useSWR from "swr"
import { ProfileCard } from "@/components/profile/profile-card"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/use-wallet-data"
import type { UserPublic } from "@/services/types"

export default function ProfilePage() {
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const principal = identity?.getPrincipal().toText() ?? ""

  // Principal last in the key so useRefreshWallet's invalidation matches it.
  const { data: user, isLoading, mutate } = useSWR(
    identity ? (["profile", principal] as const) : null,
    async () => {
      const actor = await getWalletActor(identity!)
      const profile = await actor.getUser()
      return profile.length > 0 ? (profile[0] as UserPublic) : null
    },
    { revalidateOnFocus: false, revalidateIfStale: false, keepPreviousData: true }
  )

  const handleUpdateUsername = async (username: string): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.updateUsername(username)
      if ("ok" in result) {
        mutate(result.ok, { revalidate: false })
        // The dashboard caches the username too, and its mandatory prompt keys
        // off it -- without this the popup would still demand a username the
        // user just claimed.
        refreshWallet()
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Failed to update username"
    }
  }

  const handleCheckUsername = async (name: string): Promise<boolean> => {
    if (!identity) return false
    try {
      const actor = await getWalletActor(identity)
      return await actor.checkUsername(name)
    } catch {
      return false
    }
  }

  if (isLoading && !user) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
  if (!user) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your wallet profile</p>
      </div>
      <ProfileCard
        user={user}
        principal={principal}
        onUpdateUsername={handleUpdateUsername}
        onCheckUsername={handleCheckUsername}
      />
    </div>
  )
}
