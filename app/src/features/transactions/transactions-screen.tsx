import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions'
import { useTransactions } from '@/hooks/use-wallet-data'

const PAGE_SIZE = 20

export function TransactionsScreen() {
  const t = useTranslations('transactions')
  const [page, setPage] = useState(0)
  const { items, total, isLoading } = useTransactions(page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE))

  return (
    <View className="gap-6">
      <View>
        <Text className="text-2xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      {isLoading && items.length === 0 ? (
        <View className="gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </View>
      ) : (
        <RecentTransactions transactions={items} />
      )}
      <View className="flex-row items-center justify-between">
        <Button variant="outline" size="lg" disabled={page === 0} onPress={() => setPage((p) => p - 1)}>
          {t('previous')}
        </Button>
        <Text className="text-sm text-muted-foreground">{t('page', { page: page + 1, total: totalPages })}</Text>
        <Button
          variant="outline"
          size="lg"
          disabled={page + 1 >= totalPages}
          onPress={() => setPage((p) => p + 1)}
        >
          {t('next')}
        </Button>
      </View>
    </View>
  )
}
