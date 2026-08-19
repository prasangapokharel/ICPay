import { type ReactNode, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { formatTokenAmount } from '@/lib/wallet-utils'
import type { TokenHolding } from '@/services/tokens'

export function TokenList({
  holdings,
  isLoading,
  header,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  header?: ReactNode
}) {
  const t = useTranslations('wallet')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? holdings.filter(
        (token) => token.symbol.toLowerCase().includes(needle) || token.name.toLowerCase().includes(needle),
      )
    : holdings

  const search = (
    <SearchInput className="mb-3" value={query} onChangeText={setQuery} placeholder={t('searchTokens')} />
  )

  if (isLoading && holdings.length === 0) {
    return (
      <View className="flex-1">
        {header}
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
        {header}
        <Text className="py-6 text-center text-sm text-muted-foreground">{t('noTokens')}</Text>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      data={filtered}
      keyExtractor={(token) => token.ledgerId}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={12}
      windowSize={7}
      ListHeaderComponent={
        <View>
          {header}
          {search}
        </View>
      }
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
  )
}
