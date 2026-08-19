import { View, type TextInputProps } from 'react-native'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function SearchInput({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <View className={cn('py-px', className)}>
      <View className="relative">
        <View className="pointer-events-none absolute bottom-0 left-3.5 top-0 z-10 w-5 items-center justify-center">
          <Icon icon={Search01Icon} size={16} />
        </View>
        <Input variant="search" className="leading-normal" {...props} />
      </View>
    </View>
  )
}
