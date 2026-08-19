import { useMemo } from 'react'
import { View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { avatarSvgFor } from '@/lib/avatar'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export function UserAvatar({
  seed,
  size = 36,
  className,
}: {
  seed?: string
  size?: number
  className?: string
}) {
  const normalized = (seed ?? '').replace(/^@/, '')
  const xml = useMemo(() => (normalized ? avatarSvgFor(normalized) : ''), [normalized])
  const initials = (normalized || '?').slice(0, 2).toUpperCase()

  return (
    <View
      className={cn('overflow-hidden rounded-full bg-muted', className)}
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: 'rgba(127,127,127,0.18)',
      }}
    >
      {xml ? (
        <SvgXml xml={xml} width={size} height={size} />
      ) : (
        <View className="size-full items-center justify-center">
          <Text className="text-[10px] font-medium">{initials}</Text>
        </View>
      )}
    </View>
  )
}
