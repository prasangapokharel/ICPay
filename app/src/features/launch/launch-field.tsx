import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export function LaunchField({
  label,
  count,
  error,
  hint,
  children,
}: {
  label: string
  count?: string
  error?: string | null
  hint?: string
  children: React.ReactNode
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
        {count ? <Text className="text-xs tabular-nums text-muted-foreground">{count}</Text> : null}
      </View>
      {children}
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  )
}

export function LaunchRow({
  label,
  value,
  mono,
  muted,
  emphasis,
}: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
  emphasis?: boolean
}) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-0.5">
      <Text className="shrink-0 text-xs text-muted-foreground">{label}</Text>
      <Text
        className={cn(
          'min-w-0 flex-1 text-right text-sm',
          mono && 'font-mono text-xs',
          muted && 'text-muted-foreground',
          emphasis && 'font-semibold tabular-nums',
        )}
      >
        {value}
      </Text>
    </View>
  )
}
