import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useToken } from '@/hooks/use-launch-data'
import { failureReason, statusOf } from '@/services/launch/launch'
import { formatTokenAmount, formatTime } from '@/lib/wallet-utils'

export function LaunchDetailScreen() {
  const t = useTranslations('launch')
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokenId = typeof id === 'string' ? id : ''
  const { token, isLoading } = useToken(tokenId || null)

  if (isLoading || !tokenId) {
    return (
      <View className="gap-4 pt-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
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

  const status = statusOf(token)
  const reason = failureReason(token)
  const ledgerId = token.ledgerId[0]

  return (
    <View className="gap-4 pt-2">
      <Text className="text-xl font-bold">{token.name}</Text>
      <Text className="font-mono text-sm text-muted-foreground">{token.symbol}</Text>
      <Badge>{t(`status.${status}`)}</Badge>
      {status === 'pending' ? (
        <Alert>
          <AlertDescription>{t('pendingBody')}</AlertDescription>
        </Alert>
      ) : null}
      {status === 'failed' ? (
        <Alert variant="destructive">
          <AlertDescription>
            {t('failedBody')}
            {reason ? `\n${reason}` : ''}
          </AlertDescription>
        </Alert>
      ) : null}
      <Text className="text-sm text-muted-foreground">{token.description}</Text>
      <Text className="text-sm">
        {t('supplyLabel')}: {formatTokenAmount(token.totalSupply, token.decimals, 0)}
      </Text>
      {ledgerId ? <Text className="font-mono text-xs text-muted-foreground">{ledgerId}</Text> : null}
      <Text className="text-xs text-muted-foreground">{formatTime(token.createdAt)}</Text>
    </View>
  )
}
