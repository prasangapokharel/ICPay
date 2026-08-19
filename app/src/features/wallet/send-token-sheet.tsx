import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { QrScanPanel } from '@/components/scan/qr-scan-panel'
import { SendTokenForm, SendRow } from '@/features/wallet/send-token-form'
import { useDebounced } from '@/hooks/use-debounced'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { useResolvedUsername } from '@/hooks/use-wallet-data'
import { addressText, detectTypedAddress, type ScannedAddress } from '@/lib/icp-address'
import { amountFieldValue, parsePaymentLink } from '@/lib/pay-link'
import { validateUsername } from '@/lib/username'
import { formatTokenAmount, memoByteLength, MEMO_MAX_BYTES, parseTokenAmount, toPlainTokenAmount } from '@/lib/wallet-utils'
import { ICP_LEDGER_ID, type TokenHolding } from '@/services/tokens'
import type { TransferMode } from '@/services/transfer/transfer'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { usePaymentPin } from '@/features/security/use-payment-pin'

const E8S = 100_000_000
const MODE_FOR: Record<ScannedAddress['kind'], TransferMode> = {
  account: 'account',
  icrc1: 'principal',
  principal: 'principal',
  username: 'username',
}

export function SendTokenSheet({
  open,
  onOpenChange,
  token,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: TokenHolding
  onSend: (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array,
  ) => Promise<string | null>
}) {
  const t = useTranslations('sendToken')
  const tc = useTranslations('common')
  const ts = useTranslations('scan')
  const tt = useTranslations('transfer')
  const td = useTranslations('deviceSecurity')
  const [username, setUsername] = useState('')
  const [value, setValue] = useState('')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<TransferMode>('username')
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)
  const [step, setStep] = useState<'form' | 'scan' | 'confirm'>('form')
  const pin = usePaymentPin(open && step === 'confirm')
  const amount = parseTokenAmount(value, token.decimals)
  const total = amount === null ? null : amount + token.fee
  const sendable = token.balance > token.fee ? token.balance - token.fee : 0n
  const insufficient = total !== null && total > token.balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const handle = username.trim().replace(/^@/, '').toLowerCase()
  const recipient = mode === 'username' ? handle : username.trim()
  const isIcp = token.ledgerId === ICP_LEDGER_ID
  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)
  const debouncedHandle = useDebounced(mode === 'username' ? handle : '')
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedHandle)
  const { price } = useIcpPrice()
  const usd = isIcp && amount !== null && price ? (Number(amount) / E8S) * price.usd : null
  const canSend =
    (mode === 'username' ? validateUsername(handle) === null : recipient.length > 0) &&
    amount !== null &&
    !insufficient &&
    !memoTooLong &&
    !loading

  const applyAddress = (hit: ScannedAddress, raw = '') => {
    if (hit.kind === 'account' && !isIcp) {
      setError(t('accountIdIcpOnly', { symbol: token.symbol }))
      return
    }
    setMode(MODE_FOR[hit.kind])
    setUsername(addressText(hit))
    setSubaccount(hit.kind === 'icrc1' ? hit.subaccount : null)
    setError(null)
    const req = parsePaymentLink(raw)
    if (req?.amount !== undefined) setValue(amountFieldValue(req.amount))
    if (req?.memo !== undefined) setMemo(req.memo)
    setStep('form')
  }

  const close = (next: boolean) => {
    if (!next) {
      setStep('form')
      setError(null)
    }
    onOpenChange(next)
  }

  const submit = async () => {
    if (amount === null) return
    if (!(await pin.gate())) return
    setLoading(true)
    setError(null)
    const err = await onSend(mode, recipient, amount, memo.trim() || undefined, subaccount ?? undefined)
    setLoading(false)
    if (err) {
      setError(err)
      setStep('form')
      return
    }
    setUsername('')
    setMode('username')
    setSubaccount(null)
    setValue('')
    setMemo('')
    setStep('form')
    onOpenChange(false)
  }

  const title = pin.pinStep
    ? td('unlock')
    : step === 'scan'
      ? ts('title')
      : step === 'confirm'
        ? tt('confirmTitle')
        : t('title', { symbol: token.symbol })
  const description = pin.pinStep
    ? td('unlockBody')
    : step === 'scan'
      ? ts('description')
      : step === 'confirm'
        ? tt('confirmBody')
        : t('subtitle', { symbol: token.symbol })

  return (
    <Sheet open={open} onOpenChange={close} title={title} description={description}>
      {step === 'scan' ? (
        <>
          <QrScanPanel onScan={applyAddress} />
          <Button className="mt-4 w-full" variant="outline" onPress={() => setStep('form')}>
            {tc('cancel')}
          </Button>
        </>
      ) : step === 'confirm' && pin.pinStep ? (
        <ConfirmPin
          onVerified={() => {
            pin.onVerified()
            void submit()
          }}
          onBack={pin.cancel}
        />
      ) : step === 'confirm' ? (
        <>
          <View className="mb-4 items-center rounded-2xl bg-muted/40 p-4">
            <Text className="text-3xl font-bold tabular-nums">{amount === null ? '—' : full(amount)}</Text>
            <Text className="mt-1 text-xs text-muted-foreground">{token.symbol}</Text>
            <FiatAmount usd={usd} className="mt-1" />
          </View>
          <View className="mb-3 flex-row items-center gap-3 rounded-2xl bg-muted/50 p-3">
            <UserAvatar seed={recipient} size={40} />
            <Text className="min-w-0 flex-1 text-sm">{recipient}</Text>
          </View>
          <SendRow label={tc('fee')} value={`${full(token.fee)} ${token.symbol}`} />
          <SendRow label={t('total')} value={total === null ? '—' : `${full(total)} ${token.symbol}`} />
          {error ? (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button className="mt-5 w-full" disabled={loading} onPress={() => void submit()}>
            {loading ? t('sending') : tt('confirmSend')}
          </Button>
          <Button className="mt-2 w-full" variant="outline" disabled={loading} onPress={() => setStep('form')}>
            {tc('cancel')}
          </Button>
        </>
      ) : (
        <SendTokenForm
          token={token}
          username={username}
          value={value}
          memo={memo}
          mode={mode}
          handle={handle}
          resolved={resolved}
          resolving={resolving}
          debouncedHandle={debouncedHandle}
          sendable={sendable}
          insufficient={insufficient}
          memoTooLong={memoTooLong}
          canSend={canSend}
          usd={usd}
          error={error}
          full={full}
          total={total}
          onRecipient={(raw) => {
            const hit = detectTypedAddress(raw)
            if (hit) {
              applyAddress(hit, raw)
              return
            }
            setUsername(raw)
            setMode('username')
            setSubaccount(null)
            setError(null)
          }}
          onValue={(next) => {
            setValue(next)
            setError(null)
          }}
          onMemo={setMemo}
          onPercent={(next) => {
            setValue(toPlainTokenAmount(next, token.decimals))
            setError(null)
          }}
          onScan={() => setStep('scan')}
          onReview={() => setStep('confirm')}
        />
      )}
    </Sheet>
  )
}
