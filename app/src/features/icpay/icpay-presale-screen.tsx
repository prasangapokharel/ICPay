import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslations } from '@/components/i18n/locale-provider'
import { BgImageCard } from '@/components/ui/bg-image-card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { SendSuccess } from '@/components/shared/send-success'
import { IcpayPresaleBuySheet } from '@/features/icpay/icpay-presale-buy-sheet'
import { PresaleGuideSheet } from '@/features/icpay/presale-guide-sheet'
import { PresaleStatsPanel } from '@/features/icpay/presale-stats-panel'
import { useAuth } from '@/components/auth/auth-provider'
import { useIcpaySale } from '@/hooks/use-icpay-sale'
import { useIcpayStats } from '@/hooks/use-icpay-stats'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { hasSeenPresaleGuide, markPresaleGuideSeen } from '@/lib/icpay/presaleGuide'
import { buyIcpay, icpayReceiveAmount } from '@/services/icpay/sale'
import type { IcpayPurchase } from '@/services/wallet'
import { formatAmount, formatTokenAmount, parseTokenAmount } from '@/lib/wallet-utils'
import { images } from '@/constants/images'
import { usePaymentPin } from '@/features/security/use-payment-pin'

const ICP_DECIMALS = 8
const ICPAY_SYMBOL = 'ICPAY'

export function IcpayPresaleScreen() {
  const t = useTranslations('buyIcpay')
  const { identity } = useAuth()
  const { stats } = useIcpayStats()
  const { sale, rate, isLoading, refresh } = useIcpaySale()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [buyOpen, setBuyOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<IcpayPurchase | null>(null)
  const pin = usePaymentPin(buyOpen)
  const icpAmount = parseTokenAmount(value, ICP_DECIMALS)
  const receive = icpAmount !== null && rate !== undefined ? icpayReceiveAmount(icpAmount, rate) : null
  const symbol = stats?.symbol ?? ICPAY_SYMBOL

  useEffect(() => {
    if (sale?.active && !hasSeenPresaleGuide()) setGuideOpen(true)
  }, [sale?.active])

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
    <View className="gap-4 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('heroTitle')}</Text>
        <Text className="text-sm text-muted-foreground">{t('pageSubtitle')}</Text>
      </View>
      <BgImageCard minHeight={420} contentClassName="gap-5 px-5 py-6">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="size-13 overflow-hidden rounded-full">
              <Image source={images.icpayToken} className="size-full" contentFit="cover" />
            </View>
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="text-lg font-bold">{t('heroTitle')}</Text>
                {sale?.active ? (
                  <View className="rounded-full bg-amber-300 px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-amber-950">{t('liveBadge')}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs text-muted-foreground">{t('heroSubtitle')}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('viewGuide')}
            onPress={() => setGuideOpen(true)}
            className="size-8 items-center justify-center rounded-full"
          >
            <AppIcon name="info" size={18} />
          </Pressable>
        </View>
        <View className="items-center py-2">
          <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {t('rateInfoTitle')}
          </Text>
          <Text className="mt-2 text-2xl font-bold text-amber-500">{t('heroRate')}</Text>
        </View>
        <PresaleStatsPanel sale={sale} symbol={symbol} isLoading={isLoading} />
        <View className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3">
          <Text className="text-xs leading-relaxed text-muted-foreground">{t('liquidityInfo')}</Text>
        </View>
        <Button size="lg" className="w-full bg-amber-300" disabled={!sale?.active} onPress={() => setBuyOpen(true)}>
          <Text className="font-semibold text-amber-950">{sale?.active ? t('openBuy') : t('soldOut')}</Text>
        </Button>
      </BgImageCard>
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
      <PresaleGuideSheet
        open={guideOpen}
        onClose={() => {
          markPresaleGuideSeen()
          setGuideOpen(false)
        }}
      />
    </View>
  )
}
