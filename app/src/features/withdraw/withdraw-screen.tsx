import { useState } from 'react'
import { View } from 'react-native'
import { QrCodeScanIcon } from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { SendSuccess } from '@/components/shared/send-success'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { QrScanner } from '@/components/scan/qr-scanner'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAuth } from '@/components/auth/auth-provider'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { withdraw } from '@/services/withdraw/withdraw'
import { addressText, type ScannedAddress } from '@/lib/icp-address'
import { formatAmount, ICP_FEE, isHexAccountId, parseIcp } from '@/lib/wallet-utils'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { usePaymentPin } from '@/features/security/use-payment-pin'
import { Principal } from '@icp-sdk/core/principal'

const E8S = 100_000_000

export function WithdrawScreen() {
  const t = useTranslations('withdraw')
  const tc = useTranslations('common')
  const ts = useTranslations('deviceSecurity')
  const tt = useTranslations('transfer')
  const { identity } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const pin = usePaymentPin(confirmOpen)
  const [sent, setSent] = useState<{ amount: bigint; recipient: string; blockIndex: bigint } | null>(null)
  const parsed = parseIcp(amount)
  const total = parsed !== null ? parsed + ICP_FEE : null
  const { price } = useIcpPrice()
  const usd = parsed !== null && price ? (Number(parsed) / E8S) * price.usd : null

  const validDest = (() => {
    const value = destination.trim()
    if (!value) return false
    if (isHexAccountId(value)) return true
    try {
      Principal.fromText(value)
      return true
    } catch {
      return false
    }
  })()

  const applyScan = (hit: ScannedAddress) => {
    if (hit.kind === 'username') {
      setError(t('invalidDestination'))
      return
    }
    setDestination(addressText(hit))
    setError(null)
  }

  const submit = async () => {
    if (!validDest) {
      setError(t('invalidDestination'))
      return
    }
    if (!parsed) {
      setError(t('amountRequired'))
      return
    }
    if (balance != null && parsed + ICP_FEE > balance) {
      setError(t('overBalance'))
      return
    }
    if (!(await pin.gate())) return
    setLoading(true)
    setError(null)
    const result = await withdraw(identity, parsed, destination.trim())
    setLoading(false)
    if ('err' in result) {
      setError(result.err)
      setConfirmOpen(false)
      return
    }
    refreshWallet()
    setConfirmOpen(false)
    setSent({ amount: parsed, recipient: destination.trim(), blockIndex: result.ok.blockIndex })
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        onDone={() => setSent(null)}
      />
    )
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <View className="relative">
        <Input
          value={destination}
          onChangeText={(raw) => {
            setDestination(raw)
            setError(null)
          }}
          autoCapitalize="none"
          placeholder={t('destinationPlaceholder')}
          size="lg"
          className="pr-12"
        />
        <View className="absolute top-0 right-1.5 bottom-0 justify-center">
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel={tt('scanQr')}
            className="size-10"
            onPress={() => setScanOpen(true)}
          >
            <Icon icon={QrCodeScanIcon} size={18} />
          </Button>
        </View>
      </View>
      <Input value={amount} onChangeText={setAmount} keyboardType="decimal-pad" size="amount" />
      <FiatAmount usd={usd} />
      <Text className="text-xs text-muted-foreground">
        {t('networkFee')}: {formatAmount(ICP_FEE)} ICP
      </Text>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button size="lg" disabled={!validDest || !parsed} onPress={() => setConfirmOpen(true)}>
        {t('submit')}
      </Button>
      <Sheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pin.pinStep ? ts('unlock') : t('title')}
        description={pin.pinStep ? ts('unlockBody') : undefined}
      >
        {pin.pinStep ? (
          <ConfirmPin
            onVerified={() => {
              pin.onVerified()
              void submit()
            }}
            onBack={pin.cancel}
          />
        ) : (
          <>
            <View className="mb-6 items-center rounded-3xl bg-muted/40 px-6 py-8">
              <Text className="text-5xl font-bold tabular-nums">{parsed ? formatAmount(parsed) : '—'}</Text>
              <Text className="mt-2 text-base text-muted-foreground">ICP</Text>
              <FiatAmount usd={usd} className="mt-2" />
            </View>
            <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-muted/50 p-3">
              <UserAvatar seed={destination.trim()} size={40} />
              <Text className="min-w-0 flex-1 font-mono text-xs">{destination.trim()}</Text>
            </View>
            <View className="rounded-xl bg-muted/30 p-3">
              <View className="flex-row items-start justify-between gap-4">
                <Text className="text-xs text-muted-foreground">{t('networkFee')}</Text>
                <Text className="text-sm font-medium">{formatAmount(ICP_FEE)} ICP</Text>
              </View>
              <View className="my-2 h-px bg-border/40" />
              <View className="flex-row items-start justify-between gap-4">
                <Text className="text-xs text-muted-foreground">{t('totalDeducted')}</Text>
                <Text className="text-sm font-medium">{total ? formatAmount(total) : '—'} ICP</Text>
              </View>
            </View>
            <Button className="mt-6 w-full" size="lg" disabled={loading} onPress={() => void submit()}>
              {loading ? t('sending') : t('submit')}
            </Button>
            <Button className="mt-2 w-full" variant="outline" size="lg" disabled={loading} onPress={() => setConfirmOpen(false)}>
              {tc('cancel')}
            </Button>
          </>
        )}
      </Sheet>
      <QrScanner open={scanOpen} onOpenChange={setScanOpen} onScan={applyScan} />
    </View>
  )
}
