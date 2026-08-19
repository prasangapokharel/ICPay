import { Pressable, View } from 'react-native'
import { QrCodeScanIcon } from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { shortPrincipal, memoByteLength, MEMO_MAX_BYTES, parseTokenAmount } from '@/lib/wallet-utils'
import type { TokenHolding } from '@/services/tokens'
import type { TransferMode } from '@/services/transfer/transfer'

const PERCENTAGES = [10, 25, 50, 75]

export function SendTokenForm({
  token,
  username,
  value,
  memo,
  mode,
  handle,
  resolved,
  resolving,
  debouncedHandle,
  sendable,
  insufficient,
  memoTooLong,
  canSend,
  usd,
  error,
  full,
  total,
  onRecipient,
  onValue,
  onMemo,
  onPercent,
  onScan,
  onReview,
}: {
  token: TokenHolding
  username: string
  value: string
  memo: string
  mode: TransferMode
  handle: string
  resolved: string | null
  resolving: boolean
  debouncedHandle: string
  sendable: bigint
  insufficient: boolean
  memoTooLong: boolean
  canSend: boolean
  usd: number | null
  error: string | null
  full: (v: bigint) => string
  total: bigint | null
  onRecipient: (raw: string) => void
  onValue: (next: string) => void
  onMemo: (next: string) => void
  onPercent: (next: bigint) => void
  onScan: () => void
  onReview: () => void
}) {
  const t = useTranslations('sendToken')
  const tc = useTranslations('common')
  const tt = useTranslations('transfer')
  const amountInvalid = value !== '' && parseTokenAmount(value, token.decimals) === null

  return (
    <>
      <View className="mb-4 items-center">
        <TokenLogo token={token} size={40} />
      </View>
      <Text className="mb-1.5 text-xs font-medium text-muted-foreground">{t('recipient')}</Text>
      <View className="relative">
        <Input
          value={username}
          onChangeText={onRecipient}
          autoCapitalize="none"
          placeholder={t('recipientPlaceholder')}
          size="lg"
          className={`pr-12 ${mode !== 'username' ? 'font-mono text-xs' : ''}`}
        />
        <View className="absolute top-0 right-1.5 bottom-0 justify-center">
          <Button variant="ghost" size="icon-sm" accessibilityLabel={tt('scanQr')} className="size-9" onPress={onScan}>
            <Icon icon={QrCodeScanIcon} size={16} />
          </Button>
        </View>
      </View>
      {mode === 'username' && handle.length > 0 ? (
        <View className="mt-2 flex-row items-center gap-3 rounded-2xl bg-muted/40 p-3">
          {resolving || debouncedHandle !== handle ? <Spinner /> : <UserAvatar seed={handle} size={36} />}
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold">{handle}</Text>
              <PremiumBadge name={handle} />
            </View>
            <Text className="text-xs text-muted-foreground">
              {resolving || debouncedHandle !== handle ? '…' : resolved ? shortPrincipal(resolved) : t('recipientPlaceholder')}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-4 flex-row items-baseline justify-between">
        <Text className="text-xs font-medium text-muted-foreground">{tc('amount')}</Text>
        <Text className="text-xs text-muted-foreground">
          {tc('balance')} <Text className="font-medium text-foreground">{full(token.balance)}</Text>
        </Text>
      </View>
      <View className="relative mt-1.5">
        <Input value={value} onChangeText={onValue} keyboardType="decimal-pad" placeholder="0.0" size="amount" className="pr-16" />
        {sendable > 0n ? (
          <Pressable onPress={() => onPercent(sendable)} className="absolute top-2 right-2 h-9 items-center justify-center rounded-lg bg-muted px-2.5">
            <Text className="text-xs font-semibold text-primary">{tc('max')}</Text>
          </Pressable>
        ) : null}
      </View>
      <FiatAmount usd={usd} className="mt-1" />
      {sendable > 0n ? (
        <View className="mt-2 flex-row gap-1.5">
          {PERCENTAGES.map((pct) => (
            <Button key={pct} variant="outline" size="xs" className="h-8 flex-1" onPress={() => onPercent((sendable * BigInt(pct)) / 100n)}>
              <Text className="text-xs text-muted-foreground">{pct}%</Text>
            </Button>
          ))}
        </View>
      ) : null}
      {amountInvalid ? <Text className="mt-1 text-xs text-destructive">{t('badAmount', { decimals: token.decimals })}</Text> : null}

      <View className="mt-4 flex-row items-baseline justify-between">
        <Text className="text-xs font-medium text-muted-foreground">{t('memoLabel')}</Text>
        <Text className={cn('text-xs tabular-nums', memoTooLong ? 'text-destructive' : 'text-muted-foreground')}>
          {memoByteLength(memo.trim())}/{MEMO_MAX_BYTES}
        </Text>
      </View>
      <Input value={memo} onChangeText={onMemo} placeholder={t('memoPlaceholder')} className="mt-1.5" />

      <View className="mt-4 gap-1.5 rounded-2xl bg-muted/40 p-4">
        <Row label={tc('fee')} value={`${full(token.fee)} ${token.symbol}`} />
        <Row label={t('total')} value={total === null ? '—' : `${full(total)} ${token.symbol}`} emphasis />
      </View>
      {error ? (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="mt-5 w-full" disabled={!canSend} onPress={onReview}>
        {insufficient ? t('insufficient') : tt('review')}
      </Button>
    </>
  )
}

export function SendRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className={emphasis ? 'text-sm font-semibold tabular-nums' : 'text-sm tabular-nums'}>{value}</Text>
    </View>
  )
}

function Row(props: { label: string; value: string; emphasis?: boolean }) {
  return <SendRow {...props} />
}
