import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { UserPublic, SocialPlatform } from "@/services/types"

export function setSocialLink(
  identity: Identity | undefined,
  platform: SocialPlatform,
  url: string
): Promise<Outcome<UserPublic>> {
  return call(identity, "Failed to set social link", (actor) => actor.setSocialLink(platform, url))
}

export function removeSocialLink(
  identity: Identity | undefined,
  platform: SocialPlatform
): Promise<Outcome<UserPublic>> {
  return call(identity, "Failed to remove social link", (actor) => actor.removeSocialLink(platform))
}
