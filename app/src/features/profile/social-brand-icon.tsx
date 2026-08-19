import { Github01Icon, Linkedin01Icon, Globe02Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import type { SocialKey } from '@/lib/social-platform'

const ICONS = {
  github: Github01Icon,
  linkedin: Linkedin01Icon,
  website: Globe02Icon,
} as const

export function SocialBrandIcon({ name, size = 16 }: { name: SocialKey; size?: number }) {
  return <Icon icon={ICONS[name]} size={size} color="var(--primary)" />
}
