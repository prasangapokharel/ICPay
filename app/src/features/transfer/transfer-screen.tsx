import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { QrCodeScanIcon } from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { AppIcon } from '@/components/ui/app-icon'
import { Icon } from '@/components/ui/icon'
import { UserAvatar } from '@/components/ui/user-avatar'
import { SendSuccess } from '@/components/shared/send-success'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { QrScanner } from '@/components/scan/qr-scanner'
import { BookmarkSheet } from '@/features/transfer/bookmark-sheet'
import { PostSendUsernameUpsell } from '@/features/shared/post-send-upsell'
import { useAuth } from '@/components/auth/auth-provider'
import { useLiveBalance, useRefreshWallet, useOwnProfile } from '@/hooks/use-wallet-data'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { transfer, type TransferMode } from '@/services/transfer/transfer'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { addressText, detectTypedAddress, type ScannedAddress } from '@/lib/icp-address'
import { amountFieldValue, parsePaymentLink } from '@/lib/pay-link'
import { formatAmount, ICP_FEE, parseIcp } from '@/lib/wallet-utils'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { usePaymentPin } from '@/features/security/use-payment-pin'

const MODE_FOR: Record<ScannedAddress['kind'], TransferMode> = {
  account: 'account',
  icrc1: 'principal',
  principal: 'principal',
  username: 'username',
}

const tabs: TransferMode[] = ['username', 'principal', 'account']
const E8S = 100_000_000

export function TransferScreen() {
  const t = useTranslations('transfer')
  const tc = useTranslations('common')
  const ts = useTranslations('deviceSecurity')
  const params = useLocalSearchParams<{ to?: string; amount?: string; memo?: string }>()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const balance = useLiveBalance()
  const [mode, setMode] = useState<TransferMode>('username')
  const [to, setTo] = useState(params.to ?? '')
  const [amount, setAmount] = useState(params.amount ?? '')
  const [memo, setMemo] = useState(params.memo ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const pin = usePaymentPin(confirmOpen)
  const [scanOpen, setScanOpen] = useState(false)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)
  const [sent, setSent] = useState<{ amount: bigint; recipient: string; blockIndex: bigint } | null>(null)
  const [showUpsell, setShowUpsell] = useState(false)
  const { data: profile } = useOwnProfile()
  const hasUsername = !!profile?.username?.[0]
  const parsed = parseIcp(amount)
  const total = parsed !== null ? parsed + ICP_FEE : null
  const insufficient = parsed !== null && balance != null && total != null && total > balance
  const { price } = useIcpPrice()
  const usd = parsed !== null && price ? (Number(parsed) / E8S) * price.usd : null

  const applyScan = (hit: ScannedAddress, raw: string) => {
    setMode(MODE_FOR[hit.kind])
    setTo(addressText(hit))
    setSubaccount(hit.kind === 'icrc1' ? hit.subaccount : null)
    setError(null)
    const req = parsePaymentLink(raw)
    if (!req) return
    if (req.amount !== undefined) setAmount(amountFieldValue(req.amount))
    if (req.memo !== undefined) setMemo(req.memo)
  }

  const submit = async () => {
    if (!parsed) return
    if (!(await pin.gate())) return
    setLoading(true)
    setError(null)
    const result = await transfer(identity, ICP_LEDGER_ID, mode, to.trim(), parsed, memo || undefined, subaccount ?? undefined)
    setLoading(false)
    if ('err' in result) {
      setError(result.err)
      setConfirmOpen(false)
      return
    }
    refreshWallet()
    setConfirmOpen(false)
    setSent({
      amount: parsed,
      recipient: mode === 'username' && !to.startsWith('@') ? `@${to.trim()}` : to.trim(),
      blockIndex: result.ok.blockIndex,
    })
    if (!hasUsername) {
      setTimeout(() => setShowUpsell(true), 1500)
    }
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        memo={memo.trim() || undefined}
        onDone={() => setSent(null)}
      />
    )
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold tracking-tight">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <View className="flex-row rounded-full bg-muted p-1">
        {tabs.map((item) => (
          <Pressable
            key={item}
            onPress={() => setMode(item)}
            className={`min-h-11 flex-1 items-center justify-center rounded-full ${mode === item ? 'bg-background shadow-sm' : ''}`}
          >
            <Text className="text-sm font-medium">
              {item === 'username' ? t('tabUsername') : item === 'principal' ? t('tabPrincipal') : t('tabAccount')}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="relative">
        <Input
          value={to}
          onChangeText={(raw) => {
            const hit = detectTypedAddress(raw)
            if (hit) {
              applyScan(hit, raw)
              return
            }
            setTo(raw)
            setSubaccount(null)
            setError(null)
          }}
          autoCapitalize="none"
          size="lg"
          className={mode === 'username' ? 'pr-20' : 'pr-12'}
          placeholder={
            mode === 'username'
              ? t('placeholderUsername')
              : mode === 'principal'
                ? t('placeholderPrincipal')
                : t('placeholderAccount')
          }
        />
        <View className="absolute top-0 right-1.5 bottom-0 flex-row items-center">
          {mode === 'username' ? (
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel={t('bookmarks')}
              className="size-10"
              onPress={() => setBookmarksOpen(true)}
            >
              <AppIcon name="bookmarks" size={18} />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel={t('scanQr')}
            className="size-10"
            onPress={() => setScanOpen(true)}
          >
            <Icon icon={QrCodeScanIcon} size={18} />
          </Button>
        </View>
      </View>
      <Input value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={tc('amount')} size="amount" />
      <FiatAmount usd={usd} />
      {balance != null ? (
        <Text className="text-xs text-muted-foreground">
          {t('maxSendable', {
            amount: formatAmount(balance > ICP_FEE ? balance - ICP_FEE : 0n),
            fee: formatAmount(ICP_FEE),
          })}
        </Text>
      ) : null}
      <Input value={memo} onChangeText={setMemo} placeholder={t('memoPlaceholder')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button size="lg" disabled={!to || !parsed || insufficient} onPress={() => setConfirmOpen(true)}>
        {insufficient ? t('insufficientShort') : t('review')}
      </Button>
      <Sheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pin.pinStep ? ts('unlock') : t('confirmTitle')}
        description={pin.pinStep ? ts('unlockBody') : t('confirmBody')}
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
              <Text className="text-5xl font-bold tabular-nums">{parsed === null ? '—' : formatAmount(parsed)}</Text>
              <Text className="mt-2 text-base text-muted-foreground">ICP</Text>
              <FiatAmount usd={usd} className="mt-2" />
            </View>
            <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-muted/50 p-3">
              <UserAvatar seed={mode === 'username' && !to.startsWith('@') ? `@${to.trim()}` : to.trim()} size={40} />
              <Text className="min-w-0 flex-1 text-sm">{to.trim()}</Text>
            </View>
            {subaccount ? <Row label={t('rowSubaccount')} value={toHex(subaccount)} /> : null}
            <View className="rounded-xl bg-muted/30 p-3">
              <Row label={t('rowNetworkFee')} value={`${formatAmount(ICP_FEE)} ICP`} />
              <View className="my-2 h-px bg-border/40" />
              <Row label={t('rowTotalDeducted')} value={total === null ? '—' : `${formatAmount(total)} ICP`} />
            </View>
            {memo.trim() ? <Row label={t('rowMemo')} value={memo.trim()} /> : null}
            <Button className="mt-6 w-full" size="lg" disabled={loading} onPress={() => void submit()}>
              {loading ? t('sending') : t('confirmSend')}
            </Button>
            <Button className="mt-2 w-full" variant="outline" size="lg" disabled={loading} onPress={() => setConfirmOpen(false)}>
              {tc('cancel')}
            </Button>
          </>
        )}
      </Sheet>
      <QrScanner open={scanOpen} onOpenChange={setScanOpen} onScan={applyScan} />
      <BookmarkSheet
        open={bookmarksOpen}
        onOpenChange={setBookmarksOpen}
        onSelect={(username) => setTo(username)}
      />
      <PostSendUsernameUpsell open={showUpsell} onOpenChange={setShowUpsell} />
    </View>
  )
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-1.5">
      <Text className="shrink-0 text-xs text-muted-foreground">{label}</Text>
      <Text className="min-w-0 flex-1 text-right text-sm">{value}</Text>
    </View>
  )
}
