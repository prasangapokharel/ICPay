import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { TokenLogo } from '@/components/shared/token-logo'
import { SendSuccess } from '@/components/shared/send-success'
import { DepositAddressBlock } from '@/features/deposit/deposit-address-block'
import { SendTokenSheet } from '@/features/wallet/send-token-sheet'
import { useAuth } from '@/components/auth/auth-provider'
import { useDepositAddress, useRefreshWallet, useTokenHolding } from '@/hooks/use-wallet-data'
import { transfer, type TransferMode } from '@/services/transfer/transfer'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { isSwapToken } from '@/lib/swap-tokens'
import { icrc1Account } from '@/lib/account-id'
import { formatTokenAmount } from '@/lib/wallet-utils'

export function TokenScreen() {
  const t = useTranslations('token')
  const { ledgerId } = useLocalSearchParams<{ ledgerId: string }>()
  const id = typeof ledgerId === 'string' ? ledgerId : ''
  const { token, isLoading } = useTokenHolding(id || null)
  const { data: deposit } = useDepositAddress()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const router = useRouter()
  const [sendOpen, setSendOpen] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [sent, setSent] = useState<{ amount: bigint; recipient: string; blockIndex: bigint; memo?: string } | null>(null)
  const icrcAddress = deposit ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0]) : ''

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
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  return (
    <View className="gap-5 pt-2">
      <View className="items-center gap-2">
        <TokenLogo token={token} size={56} />
        <Text className="text-3xl font-bold tabular-nums">
          {formatTokenAmount(token.balance, token.decimals, token.decimals)}
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">{token.symbol}</Text>
        {token.name !== token.symbol ? <Text className="text-xs text-muted-foreground">{token.name}</Text> : null}
      </View>
      <View className="flex-row gap-2">
        <Button className="flex-1" variant="outline" onPress={() => setSendOpen(true)}>
          {t('send')}
        </Button>
        <Button className="flex-1" variant={showDeposit ? 'default' : 'outline'} onPress={() => setShowDeposit((v) => !v)}>
          {t('deposit')}
        </Button>
        {swap ? (
          <Button className="flex-1" variant="secondary" onPress={() => router.push('/swap')}>
            {t('swap')}
          </Button>
        ) : null}
      </View>
      <SendTokenSheet open={sendOpen} onOpenChange={setSendOpen} token={token} onSend={handleSend} />
      {showDeposit ? (
        <View className="gap-4">
          <View>
            <Text className="text-sm font-semibold">{t('depositTitle')}</Text>
            <Text className="text-xs text-muted-foreground">{t('depositSubtitle', { symbol: token.symbol })}</Text>
          </View>
          <DepositAddressBlock
            value={icrcAddress}
            hint={isIcp ? t('depositSubtitle', { symbol: token.symbol }) : t('depositSubtitle', { symbol: token.symbol })}
            logo={token.logo}
          />
          <View className="flex-row items-start gap-2">
            <AppIcon name="alert" size={14} />
            <Text className="flex-1 text-xs text-muted-foreground">{t('warning', { symbol: token.symbol })}</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}
