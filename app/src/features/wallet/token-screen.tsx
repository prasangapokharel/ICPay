import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { TokenActionButton } from '@/components/wallet/token-action-button'
import { TokenLogo } from '@/components/shared/token-logo'
import { SendSuccess } from '@/components/shared/send-success'
import { SendTokenSheet } from '@/features/wallet/send-token-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useRefreshWallet, useTokenHolding } from '@/hooks/use-wallet-data'
import { transfer, type TransferMode } from '@/services/transfer/transfer'
import { isSwapToken } from '@/lib/swap-tokens'
import { formatTokenAmount } from '@/lib/wallet-utils'

export function TokenScreen() {
  const t = useTranslations('token')
  const { ledgerId } = useLocalSearchParams<{ ledgerId: string }>()
  const id = typeof ledgerId === 'string' ? ledgerId : ''
  const { token, isLoading } = useTokenHolding(id || null)
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const router = useRouter()
  const [sendOpen, setSendOpen] = useState(false)
  const [sent, setSent] = useState<{ amount: bigint; recipient: string; blockIndex: bigint; memo?: string } | null>(null)

  const handleSend = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array,
  ) => {
    if (!token) return 'Missing token'
    const result = await transfer(identity, token.ledgerId, mode, to, amount, memo, subaccount)
    if ('err' in result) return result.err
    refreshWallet()
    setSent({
      amount,
      recipient: mode === 'username' ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  if (isLoading && !token) {
    return (
      <View className="gap-4 pt-2">
        <Text className="text-sm text-muted-foreground">…</Text>
      </View>
    )
  }

  if (!token) {
    return (
      <View className="gap-4 pt-2">
        <Alert variant="destructive">
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        memo={sent.memo}
        symbol={token.symbol}
        decimals={token.decimals}
        onDone={() => setSent(null)}
      />
    )
  }

  const swap = isSwapToken(token.ledgerId)

  return (
    <View className="gap-6 pt-2">
      <Button variant="ghost" size="sm" className="self-start" onPress={() => router.push('/wallet')}>
        {t('back')}
      </Button>
      <View className="items-center gap-3">
        <TokenLogo token={token} size={56} />
        <Text className="text-3xl font-bold tabular-nums">
          {formatTokenAmount(token.balance, token.decimals, token.decimals)}
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">{token.symbol}</Text>
        {token.name !== token.symbol ? <Text className="text-xs text-muted-foreground">{token.name}</Text> : null}
      </View>
      <View className="flex-row justify-center gap-10">
        <TokenActionButton kind="send" label={t('send')} onPress={() => setSendOpen(true)} />
        <TokenActionButton
          kind="deposit"
          label={t('deposit')}
          onPress={() => router.push(`/token/${token.ledgerId}/deposit` as never)}
        />
        {swap ? (
          <TokenActionButton kind="swap" label={t('swap')} onPress={() => router.push('/swap' as never)} />
        ) : null}
      </View>
      <SendTokenSheet open={sendOpen} onOpenChange={setSendOpen} token={token} onSend={handleSend} />
    </View>
  )
}
