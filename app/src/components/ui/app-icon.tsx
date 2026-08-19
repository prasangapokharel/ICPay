import { Image } from 'expo-image'
import { Platform, View } from 'react-native'
import { cn } from '@/lib/utils'
import { icons, type AppIconName } from '@/constants/icons'
import { useTheme } from '@/components/theme/theme-provider'

export type { AppIconName }

export function AppIcon({
  name,
  size = 22,
  className,
  boxed,
  onColor,
}: {
  name: AppIconName
  size?: number
  className?: string
  boxed?: 'primary' | 'muted'
  onColor?: boolean
}) {
  const { resolved } = useTheme()
  const onPrimary = boxed === 'primary' || onColor
  const darken = resolved === 'light' && !onPrimary
  const image = (
    <Image
      source={icons[name]}
      tintColor={darken && Platform.OS !== 'web' ? '#171717' : undefined}
      style={{
        width: size,
        height: size,
        ...(darken && Platform.OS === 'web' ? { filter: 'brightness(0)' } : null),
      }}
      contentFit="contain"
    />
  )
  if (!boxed) {
    return (
      <View className={cn('items-center justify-center', className)} style={{ width: size, height: size }}>
        {image}
      </View>
    )
  }
  const box = size + 16
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full',
        onPrimary ? 'bg-primary' : 'bg-muted',
        className,
      )}
      style={{ width: box, height: box }}
    >
      {image}
    </View>
  )
}
