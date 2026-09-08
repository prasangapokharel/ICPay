import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { DepositAddressBlock } from '@/features/deposit/deposit-address-block'
import { useAuth } from '@/components/auth/auth-provider'
import { useDepositAddress, useTokenHolding } from '@/hooks/use-wallet-data'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { icrc1Account } from '@/lib/account-id'

type Tab = 'icrc' | 'legacy' | 'principal'

export function TokenDepositScreen() {
  const t = useTranslations('token')
  const td = useTranslations('deposit')
  const { ledgerId } = useLocalSearchParams<{ ledgerId: string }>()
  const id = typeof ledgerId === 'string' ? ledgerId : ''
  const router = useRouter()
  const { identity } = useAuth()
  const { token, isLoading } = useTokenHolding(id || null)
  const { data: deposit, isLoading: depositLoading } = useDepositAddress()
  const [tab, setTab] = useState<Tab>('icrc')

  if (isLoading && !token) {
    return (
      <View className="items-center py-16">
        <Spinner />
      </View>
    )
  }

  if (!token) {
    return (
      <View className="gap-4 pt-2">
        <Button variant="ghost" size="sm" className="self-start" onPress={() => router.push('/wallet')}>
          {t('back')}
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{t('notFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  const icrcAddress = deposit ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0]) : ''
  const isIcp = token.ledgerId === ICP_LEDGER_ID
  const value =
    tab === 'icrc' ? icrcAddress : tab === 'legacy' ? (deposit?.accountId ?? '') : (identity?.getPrincipal().toText() ?? '')
  const hint = tab === 'icrc' ? td('hintIcrc') : tab === 'legacy' ? td('hintLegacy') : td('hintPrincipal')

  return (
    <View className="gap-6 pt-2">
      <Button variant="ghost" size="sm" className="self-start" onPress={() => router.push(`/token/${token.ledgerId}` as never)}>
        {token.symbol}
      </Button>
      <View className="flex-row items-center justify-center gap-2.5">
        <TokenLogo token={token} size={40} />
        <Text className="text-xl font-bold">{token.symbol}</Text>
      </View>
      {isIcp ? (
        <View className="flex-row rounded-full bg-muted p-1">
          {(['icrc', 'legacy', 'principal'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              className={`min-h-10 flex-1 items-center justify-center rounded-full ${tab === item ? 'bg-background shadow-sm' : ''}`}
            >
              <Text className="text-xs font-medium">
                {item === 'icrc' ? td('tabIcrc') : item === 'legacy' ? td('tabLegacy') : td('tabPrincipal')}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {depositLoading || !icrcAddress ? (
        <View className="items-center py-12">
          <Spinner />
        </View>
      ) : (
        <DepositAddressBlock value={value} hint={hint} logo={token.logo} />
      )}
      <Alert>
        <AlertDescription>{t('warning', { symbol: token.symbol })}</AlertDescription>
      </Alert>
    </View>
  )
}
