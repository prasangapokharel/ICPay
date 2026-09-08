import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { images } from '@/constants/images'
import { cn } from '@/lib/utils'

export function BgImageCard({
  children,
  className,
  contentClassName,
  minHeight,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
  minHeight?: number
}) {
  return (
    <View
      className={cn('relative overflow-hidden rounded-3xl border border-border/40 shadow-lg', className)}
      style={minHeight ? { minHeight } : undefined}
    >
      <Image source={images.presaleBg} className="absolute inset-0" contentFit="cover" />
      <View className="absolute inset-0 bg-background/75" />
      <View className={cn('relative', contentClassName)}>{children}</View>
    </View>
  )
}

export const AMBER_BTN = 'bg-amber-300'
