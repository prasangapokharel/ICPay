import { useMemo } from 'react'
import { View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { communityAvatarSvg } from '@/lib/community/avatar'
import { cn } from '@/lib/utils'

export function CommunityAvatar({
  slug,
  size = 44,
  className,
}: {
  slug: string
  size?: number
  className?: string
}) {
  const xml = useMemo(() => communityAvatarSvg(slug, size * 2), [slug, size])
  return (
    <View
      className={cn('overflow-hidden rounded-full bg-muted', className)}
      style={{ width: size, height: size }}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  )
}
