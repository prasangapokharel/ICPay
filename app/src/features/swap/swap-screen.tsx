import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { AppIcon } from '@/components/ui/app-icon'
import { useAuth } from '@/components/auth/auth-provider'
import { useApplySwapBalances } from '@/hooks/use-wallet-data'
import { useSwapQuote, useSwapTokens } from '@/hooks/use-swap'
import { executeSwap } from '@/services/swap/swap'
import { defaultSwapPair } from '@/lib/swap-tokens'
import {
  icpServiceDebit,
  icpServiceFee,
  maxSwapInput,
  minAmountOut,
  requiredBalance,
  requiredIcpSwapBalance,
} from '@/lib/swap-utils'
import { formatTokenAmount, parseTokenAmount, toPlainTokenAmount } from '@/lib/wallet-utils'
import { SwapSuccessView } from '@/features/swap/swap-success'
import { SwapTokenPicker } from '@/features/swap/swap-token-picker'
import { SwapFeeStats } from '@/features/swap/swap-fee-stats'
import { SwapTokenSelect } from '@/features/swap/swap-token-select'
import { ICP_LEDGER_ID, type TokenHolding } from '@/services/tokens'
import { ConfirmPin } from '@/features/security/confirm-pin'
import { usePaymentPin } from '@/features/security/use-payment-pin'

type Done = {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  blockIndex: bigint
  beforeIn: bigint
  beforeOut: bigint
  icpFee: bigint
}

export function SwapScreen() {
  const t = useTranslations('swap')
  const tc = useTranslations('common')
  const ts = useTranslations('deviceSecurity')
  const { identity } = useAuth()
  const { tokens, isLoading: tokensLoading } = useSwapTokens()
  const applySwapBalances = useApplySwapBalances()
  const pair = useMemo(() => defaultSwapPair(tokens), [tokens])
  const [inId, setInId] = useState<string | null>(null)
  const [outId, setOutId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [picker, setPicker] = useState<'in' | 'out' | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [fail, setFail] = useState<string | null>(null)
  const pin = usePaymentPin(confirmOpen)
  const [done, setDone] = useState<Done | null>(null)
  const tokenIn = tokens.find((item) => item.ledgerId === (inId ?? pair?.tokenIn.ledgerId)) ?? null
  const tokenOut = tokens.find((item) => item.ledgerId === (outId ?? pair?.tokenOut.ledgerId)) ?? null
  const parsed = tokenIn ? parseTokenAmount(amount, tokenIn.decimals) : null
  const { quote, error, isLoading } = useSwapQuote(tokenIn?.ledgerId ?? null, tokenOut?.ledgerId ?? null, parsed ?? 0n)
  const icpToken = tokens.find((item) => item.ledgerId === ICP_LEDGER_ID)
  const serviceDebit = icpToken ? icpServiceDebit(icpToken.fee) : null
  const totalDebit =
    parsed !== null && tokenIn
      ? tokenIn.ledgerId === ICP_LEDGER_ID && serviceDebit
        ? requiredIcpSwapBalance(parsed, tokenIn.fee, serviceDebit)
        : requiredBalance(parsed, tokenIn.fee)
      : null
  const insufficientToken =
    parsed !== null && tokenIn !== null && totalDebit !== null && totalDebit > tokenIn.balance
  const insufficientIcp =
    serviceDebit !== null &&
    icpToken !== undefined &&
    tokenIn !== null &&
    parsed !== null &&
    tokenIn.ledgerId !== ICP_LEDGER_ID &&
    icpToken.balance < serviceDebit
  const insufficient = insufficientToken || insufficientIcp

  const pickIn = (token: TokenHolding) => {
    setInId(token.ledgerId)
    if (token.ledgerId === (outId ?? tokenOut?.ledgerId)) setOutId(tokenIn?.ledgerId ?? null)
  }
  const pickOut = (token: TokenHolding) => {
    setOutId(token.ledgerId)
    if (token.ledgerId === (inId ?? tokenIn?.ledgerId)) setInId(tokenOut?.ledgerId ?? null)
  }

  const submit = async () => {
    if (!parsed || !quote || !tokenIn || !tokenOut) return
    if (!(await pin.gate())) return
    setBusy(true)
    setFail(null)
    const result = await executeSwap(identity, tokenIn.ledgerId, tokenOut.ledgerId, parsed, minAmountOut(quote.amountOutRaw))
    setBusy(false)
    if ('err' in result) {
      setFail(result.err)
      setConfirmOpen(false)
      return
    }
    applySwapBalances({
      tokenInId: tokenIn.ledgerId,
      tokenOutId: tokenOut.ledgerId,
      amountIn: parsed,
      amountOut: result.ok.amountOut,
      tokenInFee: tokenIn.fee,
      icpFee: result.ok.icpServiceFee,
    })
    setConfirmOpen(false)
    setDone({
      amountIn: parsed,
      amountOut: result.ok.amountOut,
      tokenIn,
      tokenOut,
      blockIndex: result.ok.blockIndex,
      beforeIn: tokenIn.balance,
      beforeOut: tokenOut.balance,
      icpFee: result.ok.icpServiceFee,
    })
  }

  if (done) return <SwapSuccessView {...done} onDone={() => setDone(null)} />

  if (!tokensLoading && tokens.length < 2) {
    return (
      <View className="pt-6">
        <Alert>
          <AlertDescription>{t('needTwoTokens')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  return (
    <View className="gap-4 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <SwapTokenSelect
        label={t('youPay')}
        token={tokenIn}
        amountText={amount}
        onAmountChange={setAmount}
        onPickToken={() => {
          if (!tokensLoading) setPicker('in')
        }}
        balance={tokenIn?.balance}
        onMax={
          tokenIn
            ? () => {
                const max = maxSwapInput(
                  tokenIn.balance,
                  tokenIn.fee,
                  tokenIn.ledgerId === ICP_LEDGER_ID ? icpServiceDebit(tokenIn.fee) : undefined,
                )
                setAmount(toPlainTokenAmount(max, tokenIn.decimals))
              }
            : undefined
        }
      />
      <Button
        variant="outline"
        size="icon"
        accessibilityLabel={t('flip')}
        className="size-12 self-center rounded-full shadow-md"
        onPress={() => {
          setInId(tokenOut?.ledgerId ?? null)
          setOutId(tokenIn?.ledgerId ?? null)
        }}
      >
        <AppIcon name="swap" size={18} />
      </Button>
      <SwapTokenSelect
        label={t('youReceive')}
        token={tokenOut}
        amountText={
          quote && tokenOut ? formatTokenAmount(quote.amountOut, tokenOut.decimals) : isLoading ? '…' : '0'
        }
        onPickToken={() => {
          if (!tokensLoading) setPicker('out')
        }}
        readOnly
      />
      {parsed !== null && tokenIn ? (
        <SwapFeeStats
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amountIn={parsed}
          quote={quote}
          icpToken={icpToken}
        />
      ) : null}
      {insufficient ? (
        <Alert variant="destructive">
          <AlertDescription>
            {insufficientIcp && !insufficientToken
              ? t('insufficientIcp', {
                  fee: `${formatTokenAmount(icpServiceFee(), icpToken?.decimals ?? 8)} ICP`,
                })
              : t('insufficientBalance')}
          </AlertDescription>
        </Alert>
      ) : null}
      {error || fail ? (
        <Alert variant="destructive">
          <AlertDescription>{fail ?? (error instanceof Error ? error.message : 'Quote failed')}</AlertDescription>
        </Alert>
      ) : null}
      <Button size="lg" disabled={isLoading || !quote || !tokenIn || !tokenOut || insufficient} onPress={() => setConfirmOpen(true)}>
        {isLoading ? t('fetchingQuote') : t('review')}
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
            <View className="mb-4 rounded-xl bg-muted/40 p-4">
              <Text className="mb-2 text-xs font-medium text-muted-foreground">{t('youPay')}</Text>
              <Text className="text-2xl font-bold">
                {formatTokenAmount(parsed ?? 0n, tokenIn?.decimals ?? 8)} {tokenIn?.symbol}
              </Text>
            </View>
            <View className="mb-4 rounded-xl bg-muted/40 p-4">
              <Text className="mb-2 text-xs font-medium text-muted-foreground">{t('youReceive')}</Text>
              <Text className="text-2xl font-bold text-success">
                {quote && tokenOut ? formatTokenAmount(quote.amountOut, tokenOut.decimals) : '—'} {tokenOut?.symbol}
              </Text>
            </View>
            <Button className="mt-6 w-full" size="lg" disabled={busy || !quote} onPress={() => void submit()}>
              {busy ? t('swapping') : t('confirmSwap')}
            </Button>
            <Button className="mt-2 w-full" variant="outline" size="lg" disabled={busy} onPress={() => setConfirmOpen(false)}>
              {tc('cancel')}
            </Button>
          </>
        )}
      </Sheet>
      <SwapTokenPicker
        open={picker === 'in'}
        onOpenChange={(open) => setPicker(open ? 'in' : null)}
        tokens={tokens}
        isLoading={tokensLoading}
        selectedId={tokenIn?.ledgerId ?? null}
        onSelect={pickIn}
        title={t('selectPay')}
      />
      <SwapTokenPicker
        open={picker === 'out'}
        onOpenChange={(open) => setPicker(open ? 'out' : null)}
        tokens={tokens.filter((item) => item.ledgerId !== tokenIn?.ledgerId)}
        isLoading={tokensLoading}
        selectedId={tokenOut?.ledgerId ?? null}
        onSelect={pickOut}
        title={t('selectReceive')}
      />
    </View>
  )
}
