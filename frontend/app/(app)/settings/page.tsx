"use client"

import useSWR from "swr"
import { SettingsForm } from "@/components/settings/settings-form"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"

export default function SettingsPage() {
  const { identity } = useAuth()

  // Cached like every other read: settings change only when this page writes
  // them, and the write below seeds the cache directly, so revisiting the page
  // never needs to call the canister again.
  const { data: settings, isLoading, mutate } = useSWR(
    identity ? (["settings", identity.getPrincipal().toText()] as const) : null,
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getSettings()
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    { revalidateOnFocus: false, revalidateIfStale: false, keepPreviousData: true }
  )

  const handleSave = async (theme: string, language: string, notifications: boolean): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.updateSettings(theme, language, notifications)
      if ("ok" in result) {
        // The canister returns the saved record, so the cache can be updated
        // from it without a follow-up read.
        mutate(result.ok, { revalidate: false })
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Failed to save settings"
    }
  }

  if (isLoading && !settings) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
  if (!settings) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your wallet experience</p>
      </div>
      <SettingsForm settings={settings} onSave={handleSave} />
    </div>
  )
}
