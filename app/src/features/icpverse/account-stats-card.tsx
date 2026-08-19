import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Principal } from '@icp-sdk/core/principal'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { formatAmount, copyText, E8S } from '@/lib/wallet-utils'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { useFiatValue } from '@/hooks/use-fiat-value'
import { useAccountStats } from '@/hooks/use-wallet-data'
import { cn } from '@/lib/utils'

export function AccountStatsCard({ principal }: { principal: string }) {
  const t = useTranslations('accountStats')
  const { stats, isLoading } = useAccountStats(principal)
  const { price } = useIcpPrice()
  const usd = price && stats ? (Number(stats.balance) / Number(E8S)) * price.usd : null
  const fiat = useFiatValue(usd)

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (!stats) return null

  return (
    <View className="w-full overflow-hidden rounded-2xl bg-border">
      <View className="flex-row flex-wrap">
        <Cell label={t('balance')} value={`${formatAmount(stats.balance)} ICP`} strong />
        <Cell label={t('transactions')} value={stats.txCount === 0 ? '—' : String(stats.txCount)} strong />
        <Cell label={t('value')} value={fiat.formatted === null ? '—' : `≈ ${fiat.symbol}${fiat.formatted}`} />
        <Cell label={t('sinceBlock')} value={stats.firstBlock === undefined ? '—' : compact(stats.firstBlock)} />
      </View>
      <View className="gap-2 bg-card px-3.5 py-3">
        <CopyRow label={t('principal')} value={principal} />
        <Row label={t('type')} value={t(`kinds.${principalKind(principal)}`)} />
        <Row label={t('bytes')} value={String(principalBytes(principal))} />
        {stats.lastBlock !== undefined ? <Row label={t('lastBlock')} value={stats.lastBlock.toString()} /> : null}
      </View>
    </View>
  )
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="w-1/2 bg-card px-3.5 py-3">
      <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      <Text className={cn('mt-1 font-mono text-xs', strong && 'text-sm font-semibold')}>{value}</Text>
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      <Text className="min-w-0 flex-1 text-right font-mono text-xs">{value}</Text>
    </View>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const tc = useTranslations('common')
  const [copied, setCopied] = useState(false)
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      <Pressable
        onPress={async () => {
          await copyText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="min-h-11 min-w-0 flex-1 justify-center"
      >
        <Text className={cn('text-right font-mono text-xs', copied && 'text-primary')}>
          {copied ? tc('copied') : value}
        </Text>
      </Pressable>
    </View>
  )
}

function principalKind(text: string): 'selfAuthenticating' | 'anonymous' | 'canister' | 'opaque' {
  const n = principalBytes(text)
  if (n === 29) return 'selfAuthenticating'
  if (n === 0) return 'anonymous'
  if (n <= 10) return 'canister'
  return 'opaque'
}

function principalBytes(text: string): number {
  try {
    return Principal.fromText(text).toUint8Array().length
  } catch {
    return 0
  }
}

function compact(n: bigint): string {
  const v = Number(n)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
