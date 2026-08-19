import { View } from 'react-native'
import { useState } from 'react'
import { BalanceCard } from '@/features/dashboard/components/balance-card'
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions'
import { UsernamePrompt } from '@/features/dashboard/components/username-prompt'
import { DashboardActions } from '@/features/dashboard/components/dashboard-actions'
import { PremiumFeaturesCard } from '@/features/dashboard/components/premium-features-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatE8s } from '@/lib/wallet-utils'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { useDashboard, useLiveBalance } from '@/hooks/use-wallet-data'
import { useTranslations } from '@/components/i18n/locale-provider'

export function DashboardScreen() {
  const { price } = useIcpPrice()
  const { data, error, isLoading } = useDashboard()
  const liveBalance = useLiveBalance()
  const [hidden, setHidden] = useState(false)
  const t = useTranslations()

  if (isLoading && !data) {
    return (
      <View className="gap-6 pt-2">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <View className="flex-row justify-around px-6">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </View>
      </View>
    )
  }

  if (error && !data) {
    return (
      <View className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t('dashboard.loadFailed')}
          </AlertDescription>
        </Alert>
      </View>
    )
  }

  if (!data) return null

  return (
    <View className="gap-6 pt-2">
      <UsernamePrompt username={data.user.username?.[0]} />
      <BalanceCard
        balance={formatE8s(liveBalance ?? 0n)}
        balanceE8s={liveBalance ?? 0n}
        price={price}
        hidden={hidden}
        onToggleHidden={() => setHidden((v) => !v)}
        username={data.user.username?.[0]}
      />
      <DashboardActions />
      <PremiumFeaturesCard hasUsername={!!data.user.username?.[0]} />
      <RecentTransactions transactions={data.recentTransactions} />
    </View>
  )
}
