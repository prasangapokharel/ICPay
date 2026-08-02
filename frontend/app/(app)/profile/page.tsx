"use client"

import useSWR from "swr"
import { ProfileCard } from "@/components/profile/profile-card"
import { ShareProfileCard } from "@/components/profile/share-profile-card"
import { useAuth } from "@/components/auth/auth-provider"
import { usePatchDashboardUser } from "@/hooks/use-wallet-data"
import { getProfile, updateUsername } from "@/services/profile/profile"
import { checkUsername } from "@/services/buy/buy"

export default function ProfilePage() {
  const { identity } = useAuth()
  const patchDashboardUser = usePatchDashboardUser()
  const principal = identity?.getPrincipal().toText() ?? ""

  // Principal in the key so switching identity cannot serve the previous
  // user's profile.
  const { data: user, isLoading, mutate } = useSWR(
    identity ? (["profile", principal] as const) : null,
    () => getProfile(identity),
    { revalidateOnFocus: false, revalidateIfStale: false, keepPreviousData: true }
  )

  const handleUpdateUsername = async (username: string): Promise<string | null> => {
    const result = await updateUsername(identity, username)
    if ("err" in result) return result.err

    mutate(result.ok, { revalidate: false })
    // The dashboard holds its own copy of the user, and the mandatory username
    // prompt keys off it. The canister already returned the saved record, so
    // patch it in rather than paying another getDashboard.
    patchDashboardUser(result.ok)
    return null
  }

  const handleCheckUsername = async (name: string): Promise<boolean> => {
    try {
      return await checkUsername(identity, name)
    } catch {
      return false
    }
  }

  if (isLoading && !user) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
  if (!user) return null

  const claimed = user.username?.[0]

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your wallet profile</p>
      </div>
      {claimed && <ShareProfileCard username={claimed} />}
      <ProfileCard
        user={user}
        principal={principal}
        onUpdateUsername={handleUpdateUsername}
        onCheckUsername={handleCheckUsername}
      />
    </div>
  )
}
