import { View, Image } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

export function Avatar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('overflow-hidden rounded-full bg-muted', className)}>{children}</View>
  )
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null
  return <Image source={{ uri: src }} accessibilityLabel={alt} className="size-full" />
}

export function AvatarFallback({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <View className={cn('size-full items-center justify-center bg-muted', className)}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  )
}
