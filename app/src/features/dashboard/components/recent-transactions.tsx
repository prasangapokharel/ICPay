import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { AppIcon } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import type { TransactionPublic } from '@/services/types'
import {
  formatTime,
  formatTokenAmount,
  shortenCounterparty,
  txStatusLabel,
  txTypeLabel,
} from '@/lib/wallet-utils'
import { useLedgerSymbol } from '@/hooks/use-wallet-data'
import { cn } from '@/lib/utils'

export function RecentTransactions({ transactions }: { transactions: TransactionPublic[] }) {
  const t = useTranslations('dashboard')
  const router = useRouter()

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold">{t('latestTransactions')}</Text>
        {transactions.length > 0 ? (
          <Pressable
            onPress={() => router.push('/transactions')}
            className="min-h-11 flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-xs font-medium text-primary">{t('seeMore')}</Text>
            <Text className="text-xs text-primary">→</Text>
          </Pressable>
        ) : null}
      </View>
      {transactions.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-border py-5">
          <AppIcon name="empty" size={22} boxed="muted" />
          <Text className="mt-3 text-sm font-medium">{t('noTransactions')}</Text>
          <Text className="mt-1 text-xs text-muted-foreground">{t('noTransactionsHint')}</Text>
        </View>
      ) : (
        <View className="rounded-2xl border border-border/40">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      )}
    </View>
  )
}

function TransactionRow({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations('transactions')
  const type = txTypeLabel(tx.txType)
  const incoming = type === 'deposit'
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const handle = counterparty.startsWith('@') ? counterparty.slice(1) : null

  return (
    <View className="flex-row items-center gap-3 border-b border-border/40 px-4 py-2 last:border-b-0 active:bg-muted/30">
      <UserAvatar seed={counterparty} size={40} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1">
          <Text className="truncate text-sm font-medium">{handle ?? shortenCounterparty(counterparty)}</Text>
          <PremiumBadge name={handle} />
        </View>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          {t(`type.${type}`)} · {formatTime(tx.createdAt)}
        </Text>
      </View>
      <View className="items-end">
        <Text className={cn('font-mono text-sm font-semibold', incoming && 'text-success')}>
          {incoming ? '+' : '−'}
          {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
        </Text>
        {status !== 'completed' ? <Badge className="mt-0.5">{t(`status.${status}`)}</Badge> : null}
      </View>
    </View>
  )
}
