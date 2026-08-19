import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'

const actions: {
  href: string
  label: 'common.send' | 'common.swap' | 'common.receive'
  imagePath: string
}[] = [
  { href: '/transfer', label: 'common.send', imagePath: require('../../../../assets/Icons8/arrow/icons8-circled-up-right-48.png') },
  { href: '/swap', label: 'common.swap', imagePath: require('../../../../assets/Icons8/icons8-dividends-48.png') },
  { href: '/deposit', label: 'common.receive', imagePath: require('../../../../assets/Icons8/arrow/icons8-circled-down-left-48.png') },
]

export function DashboardActions() {
  const t = useTranslations()
  const router = useRouter()

  return (
    <View className="flex-row justify-around px-6 pt-1">
      {actions.map((item) => (
        <Pressable
          key={item.href}
          accessibilityRole="button"
          accessibilityLabel={t(item.label)}
          onPress={() => router.push(item.href as never)}
          className="items-center gap-1.5"
        >
          <View className="size-11 items-center justify-center rounded-full bg-gray-800">
            <Image source={item.imagePath} style={{ width: 20, height: 20 }} contentFit="contain"  />
          </View>
          <Text className="text-[11px] font-medium lowercase text-foreground">{t(item.label)}</Text>
        </Pressable>
      ))}
    </View>
  )
}
