import { Image } from 'expo-image'
import { Platform, View } from 'react-native'
import { cn } from '@/lib/utils'
import { fileIcons, type FileIconName } from '@/constants/file-icons'
import { useTheme } from '@/components/theme/theme-provider'

export type { FileIconName }

export function FileIcon({
  name,
  size = 18,
  className,
  onColor,
}: {
  name: FileIconName
  size?: number
  className?: string
  onColor?: boolean
}) {
  const { resolved } = useTheme()
  const darken = resolved === 'light' && !onColor
  return (
    <View className={cn('items-center justify-center', className)} style={{ width: size, height: size }}>
      <Image
        source={fileIcons[name]}
        tintColor={darken && Platform.OS !== 'web' ? '#171717' : undefined}
        style={{
          width: size,
          height: size,
          ...(darken && Platform.OS === 'web' ? { filter: 'brightness(0)' } : null),
        }}
        contentFit="contain"
      />
    </View>
  )
}
