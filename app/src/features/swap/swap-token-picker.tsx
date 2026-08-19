import { useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { TokenLogo } from '@/components/shared/token-logo'
import { formatTokenAmount } from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'
import type { TokenHolding } from '@/services/tokens'

export function SwapTokenPicker({
  open,
  onOpenChange,
  tokens,
  isLoading,
  selectedId,
  onSelect,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: TokenHolding[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (token: TokenHolding) => void
  title: string
}) {
  const t = useTranslations('swap')
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? tokens.filter(
        (token) => token.symbol.toLowerCase().includes(needle) || token.name.toLowerCase().includes(needle),
      )
    : tokens

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title} scroll={false}>
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('searchToken')} />
      {isLoading ? (
        <View className="mt-2 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <View key={item} className="flex-row items-center gap-3 px-2 py-2.5">
              <Skeleton className="size-9 rounded-full" />
              <View className="min-w-0 flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-24" />
              </View>
              <Skeleton className="h-4 w-14" />
            </View>
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <Text className="py-8 text-center text-sm text-muted-foreground">{t('noTokens')}</Text>
      ) : (
        <FlatList
          className="mt-2 max-h-80"
          data={filtered}
          keyExtractor={(token) => token.ledgerId}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          renderItem={({ item: token }) => (
            <Pressable
              onPress={() => {
                onSelect(token)
                onOpenChange(false)
                setQuery('')
              }}
              className={cn(
                'min-h-12 flex-row items-center gap-3 rounded-2xl px-2 py-2.5',
                token.ledgerId === selectedId ? 'bg-muted' : '',
              )}
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
      )}
    </Sheet>
  )
}
