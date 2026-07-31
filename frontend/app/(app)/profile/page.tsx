"use client"

import { useEffect, useState } from "react"
import { ProfileCard } from "@/components/profile/profile-card"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import type { UserPublic } from "@/services/types"

export default function ProfilePage() {
  const { identity } = useAuth()
  const [user, setUser] = useState<UserPublic | null>(null)
  const [principal, setPrincipal] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!identity) return
      try {
        const actor = await getWalletActor(identity)
        setPrincipal(identity.getPrincipal().toText())
        const profile = await actor.getUser()
        if (profile.length > 0) setUser(profile[0] as UserPublic)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [identity])

  const handleUpdateUsername = async (username: string): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.updateUsername(username)
      if ("ok" in result) {
        setUser(result.ok)
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

  if (loading) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
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
