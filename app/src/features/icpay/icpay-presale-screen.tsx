import { useState } from 'react'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { SendSuccess } from '@/components/shared/send-success'
import { IcpayPresaleBuySheet } from '@/features/icpay/icpay-presale-buy-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useIcpaySale } from '@/hooks/use-icpay-sale'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { buyIcpay, icpayReceiveAmount } from '@/services/icpay/sale'
import type { IcpayPurchase } from '@/services/wallet'
import { formatAmount, formatTokenAmount, parseTokenAmount } from '@/lib/wallet-utils'
import { images } from '@/constants/images'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { usePaymentPin } from '@/features/security/use-payment-pin'

const ICP_DECIMALS = 8

export function IcpayPresaleScreen() {
  const t = useTranslations('buyIcpay')
  const { identity } = useAuth()
  const { sale, rate, isLoading, refresh } = useIcpaySale()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [buyOpen, setBuyOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<IcpayPurchase | null>(null)
  const pin = usePaymentPin(buyOpen)
  const icpAmount = parseTokenAmount(value, ICP_DECIMALS)
  const receive = icpAmount !== null && rate !== undefined ? icpayReceiveAmount(icpAmount, rate) : null
  const percent = sale ? Number(sale.percentSold) : 0

  const submit = async () => {
    if (!icpAmount) return
    if (!(await pin.gate())) return
    setLoading(true)
    setError(null)
    const result = await buyIcpay(identity, icpAmount)
    setLoading(false)
    if ('err' in result) {
      setError(result.err)
      return
    }
    refreshWallet()
    await refresh()
    setBuyOpen(false)
    setSuccess(result.ok)
  }

  if (success) {
    return (
      <SendSuccess
        amount={success.icpayAmount}
        recipient={success.destination || t('yourWallet')}
        blockIndex={success.icpayBlock}
        kind="icpayBuy"
        symbol="ICPAY"
        decimals={ICP_DECIMALS}
        onDone={() => setSuccess(null)}
      />
    )
  }

  if (isLoading && !sale) {
    return (
      <View className="items-center pt-16">
        <Spinner />
      </View>
    )
  }

  return (
    <View className="gap-6 pt-2">
      <View className="items-center gap-3">
        <View className="size-14 overflow-hidden rounded-full">
          <Image source={images.icpayToken} className="size-full" contentFit="cover" />
        </View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-center text-sm text-muted-foreground">{t('pageSubtitle')}</Text>
      </View>
      {sale ? (
        <View className="rounded-3xl border border-border/60 bg-muted/30 p-4">
          <Text className="text-3xl font-semibold tabular-nums">{percent}%</Text>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, percent)}%` }} />
          </View>
          <View className="mt-4 gap-1">
            <Text className="text-xs tabular-nums text-muted-foreground">
              {t('remaining', {
                amount: formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0),
                symbol: 'ICPAY',
              })}
            </Text>
            <Text className="text-xs tabular-nums text-muted-foreground">
              {t('raised', { icp: formatAmount(sale.icpRaised) })}
            </Text>
          </View>
          {!sale.active ? <Text className="mt-3 text-center text-xs font-medium text-amber-600">{t('soldOut')}</Text> : null}
        </View>
      ) : null}
      <Button size="lg" className="w-full" disabled={!sale?.active} onPress={() => setBuyOpen(true)}>
        {sale?.active ? t('openBuy') : t('soldOut')}
      </Button>
      <IcpayPresaleBuySheet
        open={buyOpen}
        onOpenChange={setBuyOpen}
        value={value}
        onValue={(next) => {
          setValue(next)
          setError(null)
        }}
        receive={receive}
        rate={rate}
        balance={balance}
        sale={sale}
        error={error}
        loading={loading}
        pinStep={pin.pinStep}
        onConfirm={() => void submit()}
        onPinVerified={() => {
          pin.onVerified()
          void submit()
        }}
        onPinBack={pin.cancel}
      />
    </View>
  )
}
