import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme/theme-provider'

export function Icon({
  icon,
  size = 20,
  className,
  color,
  strokeWidth = 1.75,
}: {
  icon: IconSvgElement
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}) {
  const { resolved } = useTheme()
  const stroke = color ?? (resolved === 'dark' ? '#f5f5f5' : '#171717')
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color={stroke}
      className={cn(className)}
    />
  )
}

export type { IconSvgElement }
