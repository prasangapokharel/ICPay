import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { formatAmount } from '@/lib/wallet-utils'
import { TIERS, USERNAME_FREE_MIN_LENGTH } from '@/lib/username'
import { tierBadgeSpans } from '@/lib/verifed/premium-tick'
import { cn } from '@/lib/utils'

export function UsernamePricing() {
  const t = useTranslations('buyUsername')
  return (
    <View className="gap-2">
      <Text className="text-xs font-medium text-muted-foreground">{t('pricing')}</Text>
      <View className="overflow-hidden rounded-2xl border border-border">
        {TIERS.map((tier, index) => (
          <View
            key={tier.labelKey}
            className={cn('flex-row items-start justify-between px-4 py-3', index > 0 ? 'border-t border-border' : '')}
          >
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium">{t(`tiers.${tier.labelKey}`)}</Text>
              <Text className="text-xs text-muted-foreground">{t(`tiers.${tier.rangeKey}`)}</Text>
              <View className="mt-1.5 flex-row flex-wrap gap-1">
                {tierBadgeSpans(tier).map((span) => {
                  const lengths = span.min === span.max ? `${span.min}` : `${span.min}-${span.max}`
                  return (
                    <View key={span.badge} className="flex-row items-center gap-1 rounded-full bg-muted px-1.5 py-0.5">
                      <PremiumBadge name={'x'.repeat(span.min)} size={12} />
                      <Text className="text-[10px] text-muted-foreground">{t('badgeChip', { lengths })}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
            <Text className="text-sm font-semibold tabular-nums">{formatAmount(tier.price)} ICP</Text>
          </View>
        ))}
      </View>
      <Text className="text-xs text-muted-foreground">{t('badgeInfo', { min: USERNAME_FREE_MIN_LENGTH })}</Text>
      <Text className="text-xs text-muted-foreground">{t('note')}</Text>
    </View>
  )
}
