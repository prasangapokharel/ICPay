import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('rounded-2xl border border-border bg-card p-4', className)}>{children}</View>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={cn('mb-3', className)}>{children}</View>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Text className={cn('text-sm font-medium', className)}>{children}</Text>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={className}>{children}</View>
}
