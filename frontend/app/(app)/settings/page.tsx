"use client"

import { useEffect, useState } from "react"
import { SettingsForm } from "@/components/settings/settings-form"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import type { SettingsPublic } from "@/services/types"

export default function SettingsPage() {
  const { identity } = useAuth()
  const [settings, setSettings] = useState<SettingsPublic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!identity) return
      try {
        const actor = await getWalletActor(identity)
        const result = await actor.getSettings()
        if ("ok" in result) setSettings(result.ok)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [identity])

  const handleSave = async (theme: string, language: string, notifications: boolean): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.updateSettings(theme, language, notifications)
      if ("ok" in result) {
        setSettings(result.ok)
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Failed to save settings"
    }
  }

  if (loading) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
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
