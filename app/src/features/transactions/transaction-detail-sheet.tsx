import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { useLedgerSymbol } from '@/hooks/use-wallet-data'
import { useIcpPrice } from '@/hooks/use-icp-price'
import type { TransactionPublic } from '@/services/types'
import {
  copyText,
  formatTime,
  formatTokenAmount,
  isHexAccountId,
  shortenCounterparty,
  txStatusLabel,
  txTypeLabel,
} from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'

export function TransactionDetailSheet({
  tx,
  open,
  onOpenChange,
}: {
  tx: TransactionPublic | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('transactions')
  const tc = useTranslations('common')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { symbol, decimals } = useLedgerSymbol(tx?.ledgerId ?? '')
  const { price } = useIcpPrice()

  if (!tx) return null

  const type = txTypeLabel(tx.txType)
  const incoming = type === 'deposit'
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const handle = counterparty.startsWith('@')
    ? counterparty.slice(1)
    : !isHexAccountId(counterparty) && !counterparty.includes('-')
      ? counterparty
      : null

  const isIcp = tx.ledgerId.includes('ryjl3') || symbol === 'ICP'
  const usd = isIcp && price ? (Number(tx.amount) / 100_000_000) * price.usd : null

  const handleCopy = (val: string, field: string) => {
    void copyText(val)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const memo = tx.memo?.[0]

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('title')}>
      <View className="gap-5 pb-4">
        {/* Amount Hero */}
        <View className="items-center rounded-3xl bg-muted/40 px-4 py-6">
          <Text className={cn('text-3xl font-bold font-mono', incoming && 'text-success')}>
            {incoming ? '+' : '−'}
            {formatTokenAmount(tx.amount, decimals)} {symbol}
          </Text>
          {usd != null ? <FiatAmount usd={usd} className="mt-1.5" /> : null}
          <View className="mt-3 flex-row gap-2">
            <Badge variant="outline">{t(`type.${type}`)}</Badge>
            <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
              {t(`status.${status}`)}
            </Badge>
          </View>
        </View>

        {/* Counterparty / Transfer Details */}
        <View className="rounded-2xl border border-border/50 bg-muted/20 p-4 gap-3.5">
          <DetailRow
            label={incoming ? t('type.deposit') : t('type.transfer')}
            content={
              <View className="flex-row items-center gap-2">
                <UserAvatar seed={counterparty} size={28} />
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm font-medium">
                    {handle ?? shortenCounterparty(counterparty)}
                  </Text>
                  {handle ? <PremiumBadge name={handle} size={14} /> : null}
                </View>
              </View>
            }
            copyValue={counterparty}
            copied={copiedField === 'counterparty'}
            onCopy={() => handleCopy(counterparty, 'counterparty')}
          />

          <View className="h-px bg-border/40" />

          <DetailRow
            label="ID"
            content={<Text className="font-mono text-xs">{tx.id.slice(0, 16)}…</Text>}
            copyValue={tx.id}
            copied={copiedField === 'id'}
            onCopy={() => handleCopy(tx.id, 'id')}
          />

          <View className="h-px bg-border/40" />

          <DetailRow
            label={tc('time') || 'Date & Time'}
            content={<Text className="text-xs text-muted-foreground">{formatTime(tx.createdAt)}</Text>}
          />

          {memo ? (
            <>
              <View className="h-px bg-border/40" />
              <DetailRow
                label="Memo"
                content={<Text className="text-sm">{memo}</Text>}
                copyValue={memo}
                copied={copiedField === 'memo'}
                onCopy={() => handleCopy(memo, 'memo')}
              />
            </>
          ) : null}
        </View>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onPress={() => onOpenChange(false)}
        >
          {tc('close') || 'Close'}
        </Button>
      </View>
    </Sheet>
  )
}

function DetailRow({
  label,
  content,
  copyValue,
  copied,
  onCopy,
}: {
  label: string
  content: React.ReactNode
  copyValue?: string
  copied?: boolean
  onCopy?: () => void
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <View className="flex-row items-center gap-2">
        {content}
        {copyValue && onCopy ? (
          <Pressable
            onPress={onCopy}
            className="rounded-lg bg-muted px-2 py-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label}`}
          >
            <Text className="text-[10px] font-medium text-muted-foreground">
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
