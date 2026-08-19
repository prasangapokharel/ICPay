import { Image } from 'expo-image'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { images } from '@/constants/images'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { formatAmount, formatTokenAmount, parseTokenAmount } from '@/lib/wallet-utils'
import type { IcpaySaleQuote } from '@/services/icpay/sale'

const ICP_DECIMALS = 8
const QUICK = ['0.1', '1', '5'] as const

export function IcpayPresaleBuySheet({
  open,
  onOpenChange,
  value,
  onValue,
  receive,
  rate,
  balance,
  sale,
  error,
  loading,
  pinStep,
  onConfirm,
  onPinVerified,
  onPinBack,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onValue: (next: string) => void
  receive: bigint | null
  rate: bigint | undefined
  balance: bigint | undefined
  sale: IcpaySaleQuote | undefined
  error: string | null
  loading: boolean
  pinStep: boolean
  onConfirm: () => void
  onPinVerified: () => void
  onPinBack: () => void
}) {
  const t = useTranslations('buyIcpay')
  const ts = useTranslations('deviceSecurity')
  const icpAmount = parseTokenAmount(value, ICP_DECIMALS)
  const minBuy = sale?.minBuyIcp ?? 10_000_000n
  const maxBuy = sale?.maxBuyIcp ?? 5_000_000_000n
  const belowMin = icpAmount !== null && icpAmount < minBuy
  const aboveMax = icpAmount !== null && icpAmount > maxBuy
  const insufficient = icpAmount !== null && balance !== undefined && icpAmount > balance
  const canBuy = icpAmount !== null && receive !== null && !belowMin && !aboveMax && !insufficient && !loading && sale?.active

  const confirmLabel = loading
    ? t('buying')
    : !sale?.active
      ? t('soldOut')
      : insufficient
        ? t('insufficient')
        : belowMin
          ? t('belowMin')
          : aboveMax
            ? t('aboveMax')
            : t('confirm')

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={pinStep ? ts('unlock') : t('confirmTitle')}
      description={pinStep ? ts('unlockBody') : undefined}
    >
      {pinStep ? (
        <ConfirmPin onVerified={onPinVerified} onBack={onPinBack} />
      ) : (
        <>
      <Text className="text-xs font-medium text-muted-foreground">{t('pay')}</Text>
      <View className="relative mt-1.5">
        <Input
          value={value}
          onChangeText={onValue}
          keyboardType="decimal-pad"
          placeholder="0.00"
          size="amount"
          className="pr-16 tabular-nums"
        />
        <Text className="absolute top-4 right-4 text-sm font-semibold text-muted-foreground">ICP</Text>
      </View>
      <View className="mt-3 flex-row gap-2">
        {QUICK.map((item) => {
          const selected = value === item
          return (
            <Button
              key={item}
              size="sm"
              variant={selected ? 'default' : 'outline'}
              className="flex-1"
              onPress={() => onValue(item)}
            >
              {item}
            </Button>
          )
        })}
      </View>

      <View className="mt-5 items-center rounded-3xl bg-muted/40 px-4 py-6">
        <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {t('receiveLabel')}
        </Text>
        <Text className="mt-2 text-4xl font-semibold tabular-nums">
          {receive === null ? '—' : formatTokenAmount(receive, ICP_DECIMALS, 0)}
        </Text>
        <View className="mt-2 flex-row items-center gap-1.5">
          <View className="size-4 overflow-hidden rounded-full">
            <Image source={images.icpayToken} className="size-full" contentFit="cover" />
          </View>
          <Text className="text-sm font-medium text-muted-foreground">ICPAY</Text>
        </View>
        {rate !== undefined ? (
          <Text className="mt-3 text-[11px] text-muted-foreground">
            1 ICP = {rate.toLocaleString('en-US')} ICPAY
          </Text>
        ) : null}
      </View>

      {balance != null ? (
        <Text className="mt-3 text-center text-xs text-muted-foreground">
          {t('balance', { amount: formatAmount(balance) })}
        </Text>
      ) : null}
      {error ? (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="mt-5 w-full" size="lg" disabled={!canBuy} onPress={onConfirm}>
        {confirmLabel}
      </Button>
        </>
      )}
    </Sheet>
  )
}
