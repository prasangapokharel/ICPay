import type { CommunityChannelPublic } from "@/services/community/community"

export function channelAvatarBytes(channel: Pick<CommunityChannelPublic, "channelAvatar">): Uint8Array | undefined {
  const raw = channel.channelAvatar[0]
  if (!raw?.length) return undefined
  return raw instanceof Uint8Array ? raw : new Uint8Array(raw)
}

export function channelAvatarDataUrl(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:image/webp;base64,${btoa(binary)}`
}

export function channelAvatarSrc(channel: Pick<CommunityChannelPublic, "channelAvatar">): string | undefined {
  const bytes = channelAvatarBytes(channel)
  return bytes ? channelAvatarDataUrl(bytes) : undefined
}
