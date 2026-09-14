import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { DepositAddressBlock } from '@/features/deposit/deposit-address-block'
import { useAuth } from '@/components/auth/auth-provider'
import { useDepositAddress, useRefreshWallet } from '@/hooks/use-wallet-data'
import { syncDeposits } from '@/services/deposit/deposit'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { icrc1Account } from '@/lib/account-id'

export function DepositScreen() {
  const t = useTranslations('deposit')
  const { data, error, isLoading } = useDepositAddress()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [tab, setTab] = useState<'icrc' | 'legacy' | 'principal'>('icrc')
  const [syncing, setSyncing] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ''
  const accountId = data?.accountId ?? ''
  const principal = identity?.getPrincipal().toText() ?? ''
  const value = tab === 'icrc' ? icrcAddress : tab === 'legacy' ? accountId : principal
  const hint = tab === 'icrc' ? t('hintIcrc') : tab === 'legacy' ? t('hintLegacy') : t('hintPrincipal')

  const handleSync = async () => {
    setSyncing(true)
    setNote(null)
    setSyncError(null)
    const result = await syncDeposits(identity, ICP_LEDGER_ID)
    setSyncing(false)
    if ('err' in result) {
      if (result.err === 'No new deposits found') setNote(result.err)
      else setSyncError(result.err)
      return
    }
    refreshWallet()
    setNote(t('syncFound'))
  }

  if (isLoading && !data) {
    return <Skeleton className="mt-4 h-64 w-full rounded-3xl" />
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold tracking-tight">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{t('loadFailed')}</AlertDescription>
        </Alert>
      ) : null}
      <View className="flex-row rounded-full bg-muted p-1">
        {(['icrc', 'legacy', 'principal'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            className={`min-h-11 flex-1 items-center justify-center rounded-full ${tab === item ? 'bg-background shadow-sm' : ''}`}
          >
            <Text className="text-xs font-medium">
              {item === 'icrc' ? t('tabIcrc') : item === 'legacy' ? t('tabLegacy') : t('tabPrincipal')}
            </Text>
          </Pressable>
        ))}
      </View>
      <DepositAddressBlock value={value} hint={hint} />
      <View className="gap-2 rounded-2xl border border-border/50 bg-muted/20 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-semibold">{t('syncTitle')}</Text>
            <Text className="text-xs text-muted-foreground">{t('syncHint')}</Text>
          </View>
          <Button
            size="sm"
            variant="outline"
            disabled={syncing}
            onPress={() => void handleSync()}
          >
            {syncing ? <Spinner /> : t('syncAction')}
          </Button>
        </View>
        {note ? (
          <Text className="mt-1 text-xs font-medium text-primary">{note}</Text>
        ) : null}
        {syncError ? (
          <Text className="mt-1 text-xs font-medium text-destructive">{syncError}</Text>
        ) : null}
      </View>
    </View>
  )
}
