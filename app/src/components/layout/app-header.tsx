import { Pressable, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import { useTranslations } from '@/components/i18n/locale-provider'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Text } from '@/components/ui/text'
import { LanguageSwitch } from '@/components/i18n/language-switch'
import { useOwnProfile } from '@/hooks/use-wallet-data'
import { isTabRoot } from '@/lib/nav'

export function AppHeader() {
  const t = useTranslations('header')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const { data: user } = useOwnProfile()
  const router = useRouter()
  const pathname = usePathname()
  const principal = identity?.getPrincipal().toText() ?? ''
  const seed = user?.username?.[0] ?? principal
  const showBack = !isTabRoot(pathname)

  return (
    <View className="h-14 flex-row items-center gap-2 bg-background/80 px-4">
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tc('back')}
          onPress={() => {
            if (router.canGoBack()) router.back()
            else router.replace('/')
          }}
          className="min-h-11 justify-center pr-2"
        >
          <Text className="text-sm font-medium">{tc('back')}</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile')}
          onPress={() => router.push('/profile')}
          className="min-h-11 min-w-11 items-center justify-center"
        >
          <UserAvatar seed={seed} size={36} />
        </Pressable>
      )}
      <View className="min-w-0 flex-1" />
      <LanguageSwitch />
    </View>
  )
}
