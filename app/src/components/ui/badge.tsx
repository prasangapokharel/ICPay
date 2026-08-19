import { View } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

const badgeVariants = cva('rounded-full px-2 py-0.5', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-muted',
      destructive: 'bg-destructive/10',
      outline: 'border border-border bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const badgeTextVariants = cva('text-[10px] font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-foreground',
      destructive: 'text-destructive',
      outline: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      {typeof children === 'string' ? (
        <Text className={cn(badgeTextVariants({ variant }))}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}
