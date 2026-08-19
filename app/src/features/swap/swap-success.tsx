import { Linking, Pressable, View } from 'react-native'
import { useMemo } from 'react'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { SuccessMark } from '@/components/shared/success-mark'
import { requiredBalance, requiredIcpSwapBalance, icpServiceDebit } from '@/lib/swap-utils'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { formatTokenAmount, explorerTxUrl } from '@/lib/wallet-utils'
import type { TokenHolding } from '@/services/tokens'

export function SwapSuccessView({
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  blockIndex,
  beforeIn,
  beforeOut,
  icpFee,
  onDone,
}: {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  blockIndex: bigint
  beforeIn: bigint
  beforeOut: bigint
  icpFee: bigint
  onDone: () => void
}) {
  const t = useTranslations('swap')
  const ts = useTranslations('success')
  const tc = useTranslations('common')
  const { afterIn, afterOut } = useMemo(() => {
    const serviceDebit = icpServiceDebit(icpFee)
    const tokenDebit =
      tokenIn.ledgerId === ICP_LEDGER_ID
        ? requiredIcpSwapBalance(amountIn, tokenIn.fee, serviceDebit)
        : requiredBalance(amountIn, tokenIn.fee)
    return {
      afterIn: beforeIn > tokenDebit ? beforeIn - tokenDebit : 0n,
      afterOut: beforeOut + amountOut,
    }
  }, [amountIn, amountOut, beforeIn, beforeOut, icpFee, tokenIn.fee, tokenIn.ledgerId])

  return (
    <View className="items-center pt-6">
      <SuccessMark />
      <Text className="mt-2 text-center text-2xl font-bold">{t('successTitle')}</Text>
      <Text className="mt-2 text-center text-sm text-muted-foreground">{t('successBody')}</Text>
      <Text className="mt-8 text-xs text-muted-foreground">{t('youReceive')}</Text>
      <Text className="mt-1 text-3xl font-bold">
        {formatTokenAmount(amountOut, tokenOut.decimals)} {tokenOut.symbol}
      </Text>
      <Text className="mt-3 text-sm text-muted-foreground">
        {t('youPay')}: {formatTokenAmount(amountIn, tokenIn.decimals)} {tokenIn.symbol}
      </Text>
      <View className="mt-8 w-full border-t border-dashed border-border pt-6">
        <Text className="text-xs text-muted-foreground">{t('balanceAfter')}</Text>
        <View className="mt-3 gap-2 rounded-2xl bg-muted/50 p-4">
          <BalanceLine symbol={tokenIn.symbol} decimals={tokenIn.decimals} before={beforeIn} after={afterIn} />
          <BalanceLine symbol={tokenOut.symbol} decimals={tokenOut.decimals} before={beforeOut} after={afterOut} />
        </View>
      </View>
      <View className="mt-6 w-full border-t border-dashed border-border pt-6">
        <Text className="text-xs text-muted-foreground">{t('blockIndex')}</Text>
        <View className="mt-3 rounded-2xl bg-muted/50 p-4">
          <Text className="font-mono text-sm">{blockIndex.toString()}</Text>
          <Pressable onPress={() => void Linking.openURL(explorerTxUrl(blockIndex))} className="mt-2 min-h-11 justify-center">
            <Text className="text-xs text-muted-foreground underline">{ts('viewOnDashboard')}</Text>
          </Pressable>
        </View>
      </View>
      <Button className="mt-8 h-11 w-full" onPress={onDone}>
        {tc('done')}
      </Button>
    </View>
  )
}

function BalanceLine({
  symbol,
  decimals,
  before,
  after,
}: {
  symbol: string
  decimals: number
  before: bigint
  after: bigint
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm font-medium">{symbol}</Text>
      <Text className="text-sm text-muted-foreground">
        {formatTokenAmount(before, decimals)} → {formatTokenAmount(after, decimals)}
      </Text>
    </View>
  )
}
