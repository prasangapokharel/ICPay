import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'

export function Screen({
  children,
  className,
  scroll = true,
}: {
  children: ReactNode
  className?: string
  scroll?: boolean
}) {
  const insets = useSafeAreaInsets()
  const bottom = 88 + Math.max(insets.bottom, 10)

  if (!scroll) {
    return (
      <View className={cn('flex-1 px-4 pt-2', className)} style={{ paddingBottom: bottom }}>
        {children}
      </View>
    )
  }
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('px-4 pt-2', className)}
      contentContainerStyle={{ paddingBottom: bottom }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}
