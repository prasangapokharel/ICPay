import { View } from 'react-native'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <View className={cn('rounded-md bg-muted', className)} />
}
