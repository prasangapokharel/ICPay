import type { SocialPlatform } from '@/services/types'

export type SocialKey = 'github' | 'linkedin' | 'website'

export function socialKey(platform: SocialPlatform): SocialKey {
  if ('github' in platform) return 'github'
  if ('linkedin' in platform) return 'linkedin'
  return 'website'
}

export function toSocialPlatform(key: SocialKey): SocialPlatform {
  if (key === 'github') return { github: null }
  if (key === 'linkedin') return { linkedin: null }
  return { website: null }
}
