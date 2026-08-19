import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { useBookmarks } from '@/hooks/use-wallet-data'
import { optionalText } from '@/lib/bucket/bucket'
import { getCachedBookmarkUsername, removeCachedBookmarkUsername } from '@/lib/bookmark-labels'
import { removeBookmark } from '@/services/bookmark/bookmark'
import type { Bookmark } from '@/services/types'

export function BookmarkSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (username: string) => void
}) {
  const t = useTranslations('bookmark')
  const { identity } = useAuth()
  const { bookmarks, mutate } = useBookmarks()
  const usable = bookmarks
    .map((item) => ({ item, username: bookmarkUsername(item) }))
    .filter((row): row is { item: Bookmark; username: string } => row.username !== null)

  const handleRemove = async (targetUserId: string) => {
    await removeBookmark(identity, targetUserId)
    removeCachedBookmarkUsername(targetUserId)
    await mutate()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('title')}>
      {usable.length === 0 ? (
        <View className="items-center py-10">
          <View className="size-12 items-center justify-center rounded-full bg-muted">
            <AppIcon name="bookmarks" size={22} />
          </View>
          <Text className="mt-3 text-sm font-medium">{t('empty')}</Text>
          <Text className="mt-1 text-center text-xs text-muted-foreground">{t('emptyHint')}</Text>
        </View>
      ) : (
        usable.map(({ item, username }) => (
          <View key={item.targetUserId} className="mb-1 flex-row items-center gap-2 rounded-2xl px-1 py-2">
            <Pressable
              className="min-w-0 flex-1 flex-row items-center gap-2.5"
              disabled={!onSelect}
              onPress={() => {
                onSelect?.(username)
                onOpenChange(false)
              }}
            >
              <UserAvatar seed={username} size={36} />
              <View className="min-w-0 flex-1 flex-row items-center gap-1">
                <Text className="truncate text-sm font-semibold">@{username}</Text>
                <PremiumBadge name={username} />
              </View>
            </Pressable>
            <Button
              variant="ghost"
              size="icon-sm"
              accessibilityLabel={t('remove')}
              onPress={() => void handleRemove(item.targetUserId)}
            >
              <AppIcon name="close" size={16} />
            </Button>
          </View>
        ))
      )}
    </Sheet>
  )
}

function bookmarkUsername(item: Bookmark): string | null {
  const fromApi = optionalText(item.username)
  if (fromApi) return fromApi.toLowerCase()
  return getCachedBookmarkUsername(item.targetUserId)
}
