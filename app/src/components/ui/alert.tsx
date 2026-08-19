import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

export function Alert({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}) {
  return (
    <View
      className={cn(
        'rounded-2xl border p-3',
        variant === 'destructive' ? 'border-destructive/40 bg-destructive/10' : 'border-border bg-muted/40',
        className,
      )}
    >
      {children}
    </View>
  )
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <Text className="text-sm text-foreground">{children}</Text>
}
