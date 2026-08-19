import { Text } from '@/components/ui/text'
import { useFiatValue } from '@/hooks/use-fiat-value'
import { cn } from '@/lib/utils'

export function FiatAmount({
  usd,
  className,
}: {
  usd: number | null
  className?: string
}) {
  const fiat = useFiatValue(usd)
  const label =
    fiat.formatted !== null
      ? `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`
      : usd !== null
        ? `≈ $${usd.toFixed(usd < 1 ? 3 : 2)} USD`
        : null
  if (!label) return null
  return <Text className={cn('text-xs tabular-nums text-muted-foreground', className)}>{label}</Text>
}
