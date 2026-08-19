import { ActivityIndicator, View } from 'react-native'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <View className={cn('items-center justify-center', className)}>
      <ActivityIndicator />
    </View>
  )
}
