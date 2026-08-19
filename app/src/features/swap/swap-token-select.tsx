import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { formatTokenAmount } from '@/lib/wallet-utils'
import type { TokenHolding } from '@/services/tokens'

export function SwapTokenSelect({
  label,
  token,
  amountText,
  onAmountChange,
  onPickToken,
  readOnly,
  balance,
  onMax,
}: {
  label: string
  token: TokenHolding | null
  amountText: string
  onPickToken: () => void
  onAmountChange?: (value: string) => void
  readOnly?: boolean
  balance?: bigint
  onMax?: () => void
}) {
  const t = useTranslations('swap')
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('selectToken')}
          onPress={onPickToken}
          className="h-11 min-w-28 flex-row items-center gap-2 rounded-full border border-border bg-muted/60 py-1.5 pr-3 pl-1.5"
        >
          {token ? <TokenLogo token={token} size={28} /> : null}
          <Text className="text-sm font-semibold">{token?.symbol ?? t('selectToken')}</Text>
          <Text className="text-muted-foreground">▾</Text>
        </Pressable>
        {readOnly ? (
          <Text className="min-w-0 flex-1 text-right text-2xl font-semibold tabular-nums">{amountText}</Text>
        ) : (
          <Input
            value={amountText}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0"
            variant="ghost"
            className="h-11 min-w-0 flex-1 px-0 text-right text-2xl font-semibold"
          />
        )}
      </View>
      {!readOnly && token && balance !== undefined ? (
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            {t('balance')}: {formatTokenAmount(balance, token.decimals)}
          </Text>
          {onMax ? (
            <Pressable onPress={onMax} className="min-h-8 justify-center">
              <Text className="text-xs font-medium text-primary">{t('max')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}
