import type { Identity } from '@icp-sdk/core/agent'

export function communityPublicListKey(identity: Identity | undefined) {
  return identity ? (['community-public', identity.getPrincipal().toText()] as const) : null
}

export function communityMineKey(identity: Identity | undefined) {
  return identity ? (['community-mine', identity.getPrincipal().toText()] as const) : null
}

export function communityChannelKey(identity: Identity | undefined, slug: string) {
  return identity ? (['community-channel', slug, identity.getPrincipal().toText()] as const) : null
}

export function communityMessagesKey(identity: Identity | undefined, slug: string) {
  return identity ? (['community-messages', slug, identity.getPrincipal().toText()] as const) : null
}

export function communityMemberKey(identity: Identity | undefined, slug: string) {
  return identity ? (['community-member', slug, identity.getPrincipal().toText()] as const) : null
}
