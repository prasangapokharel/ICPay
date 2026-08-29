import { type ReactNode, useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { AppIcon } from '@/components/ui/app-icon'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { AddTokenSheet } from '@/features/wallet/add-token-sheet'
import { formatTokenAmount } from '@/lib/wallet-utils'
import type { TokenMetadata, TokenHolding } from '@/services/tokens'

export function TokenList({
  holdings,
  isLoading,
  header,
  existingLedgerIds = [],
  onAddCustom,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  header?: ReactNode
  existingLedgerIds?: string[]
  onAddCustom?: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations('wallet')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? holdings.filter(
        (token) => token.symbol.toLowerCase().includes(needle) || token.name.toLowerCase().includes(needle),
      )
    : holdings

  const listHeader = useMemo(
    () => (
      <View>
        {header}
        <View className="mb-3 flex-row items-center justify-between gap-2">
          <Text className="text-sm font-medium">{t('tokens')}</Text>
          {onAddCustom ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('addToken')}
              onPress={() => setAddOpen(true)}
              className="size-8 items-center justify-center rounded-full border border-border"
            >
              <AppIcon name="add" size={16} />
            </Pressable>
          ) : null}
        </View>
        <SearchInput className="mb-3" value={query} onChangeText={setQuery} placeholder={t('searchTokens')} />
      </View>
    ),
    [header, onAddCustom, query, t],
  )

  if (isLoading && holdings.length === 0) {
    return (
      <View className="flex-1">
        {listHeader}
        <View className="gap-2">
          {[0, 1, 2].map((item) => (
            <View key={item} className="flex-row items-center gap-3 py-2.5">
              <Skeleton className="size-9 rounded-full" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-24" />
              </View>
              <Skeleton className="h-4 w-14" />
            </View>
          ))}
        </View>
      </View>
    )
  }

  if (holdings.length === 0) {
    return (
      <View className="flex-1">
        {listHeader}
        <Text className="py-6 text-center text-sm text-muted-foreground">{t('noTokens')}</Text>
        {onAddCustom ? (
          <AddTokenSheet
            open={addOpen}
            onOpenChange={setAddOpen}
            existingIds={existingLedgerIds}
            onAdded={onAddCustom}
          />
        ) : null}
      </View>
    )
  }

  return (
    <>
      <FlatList
        className="flex-1"
        data={filtered}
        keyExtractor={(token) => token.ledgerId}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={7}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text className="py-6 text-center text-sm text-muted-foreground">{t('noTokensFound')}</Text>
        }
        renderItem={({ item: token }) => (
          <Pressable
            onPress={() => router.push(`/token/${token.ledgerId}`)}
            className="flex-row items-center gap-3 rounded-2xl px-2 py-3 active:bg-muted/50"
          >
            <TokenLogo token={token} size={36} />
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-semibold">{token.symbol}</Text>
              <Text numberOfLines={1} className="text-xs text-muted-foreground">
                {token.name}
              </Text>
            </View>
            <Text className="text-sm font-semibold tabular-nums">
              {formatTokenAmount(token.balance, token.decimals)}
            </Text>
          </Pressable>
        )}
      />
      {onAddCustom ? (
        <AddTokenSheet
          open={addOpen}
          onOpenChange={setAddOpen}
          existingIds={existingLedgerIds}
          onAdded={onAddCustom}
        />
      ) : null}
    </>
  )
}
