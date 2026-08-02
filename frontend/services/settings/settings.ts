import type { Identity } from "@dfinity/agent"
import { call, query, unwrap, type Outcome } from "@/services/client"
import type { SettingsPublic } from "@/services/types"

export function getSettings(
  identity: Identity | undefined
): Promise<SettingsPublic> {
  return query(identity, async (actor) => unwrap(await actor.getSettings()))
}

// Returns the saved record, so the caller can seed its cache without a re-read.
export function updateSettings(
  identity: Identity | undefined,
  theme: string,
  language: string,
  notifications: boolean
): Promise<Outcome<SettingsPublic>> {
  return call(identity, "Failed to save settings", (actor) =>
    actor.updateSettings(theme, language, notifications)
  )
}
