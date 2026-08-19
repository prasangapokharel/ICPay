import { useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { UserAvatar } from '@/components/ui/user-avatar'
import { SearchInput } from '@/components/ui/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { useDebounced } from '@/hooks/use-debounced'
import { useUserSearch } from '@/hooks/use-wallet-data'
import type { UserPublic } from '@/services/types'

export function IcpverseScreen() {
  const t = useTranslations('icpverse')
  const [search, setSearch] = useState('')
  const query = search.trim()
  const { users, isLoading } = useUserSearch(useDebounced(search), 10)
  const people = users.filter((user) => user.username[0])

  const titles = (
    <View className="pb-4">
      {!query ? (
        <Text className="text-lg font-bold tracking-wide">{t('suggested')}</Text>
      ) : null}
    </View>
  )

  const listBody =
    isLoading && people.length === 0 ? (
      <View>
        {titles}
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} className="flex-row items-center gap-3 py-2.5">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </View>
        ))}
      </View>
    ) : (
      <FlatList
        className="flex-1"
        data={people}
        keyExtractor={(user) => user.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={7}
        ListHeaderComponent={titles}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm tracking-wide text-muted-foreground">
            {query ? t('noneFound', { query }) : t('empty')}
          </Text>
        }
        renderItem={({ item }) => <PersonRow user={item} />}
      />
    )

  return (
    <View className="flex-1">
      <SearchInput
        className="mb-4"
        value={search}
        onChangeText={setSearch}
        placeholder={t('searchPlaceholder')}
      />
      {listBody}
    </View>
  )
}

function PersonRow({ user }: { user: UserPublic }) {
  const router = useRouter()
  const t = useTranslations('icpverse')
  const handle = user.username[0]
  if (!handle) return null

  const isPremium = handle.length <= 3
  const rareLabel = handle.length === 1 ? 'Ultra Rare' : handle.length === 2 ? 'Rare' : handle.length === 3 ? 'Rare' : null

  return (
    <Pressable
      onPress={() => router.push(`/icpverse/${handle}`)}
      className="min-h-14 flex-row items-center gap-3 rounded-2xl px-2 py-3 active:bg-muted/50"
    >
      <UserAvatar seed={handle} size={44} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-semibold tracking-wide">{handle}</Text>
          <PremiumBadge name={handle} />
        </View>
        {isPremium && rareLabel ? (
          <View className="mt-0.5 flex-row items-center gap-1">
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-[10px] font-bold text-primary-foreground">{rareLabel}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}
