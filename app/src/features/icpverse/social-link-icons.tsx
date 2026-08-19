import { Linking, Pressable, View } from 'react-native'
import { SocialBrandIcon } from '@/features/profile/social-brand-icon'
import { socialKey } from '@/lib/social-platform'
import type { SocialLink } from '@/services/types'

export function SocialLinkIcons({ links }: { links: SocialLink[] }) {
  if (!links.length) return null
  return (
    <View className="flex-row items-center gap-3">
      {links.map((link) => {
        const key = socialKey(link.platform)
        return (
          <Pressable
            key={key}
            accessibilityRole="link"
            accessibilityLabel={key}
            onPress={() => void Linking.openURL(link.url)}
            className="size-9 items-center justify-center"
          >
            <SocialBrandIcon name={key} size={18} />
          </Pressable>
        )
      })}
    </View>
  )
}
