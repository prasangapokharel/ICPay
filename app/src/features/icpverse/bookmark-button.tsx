import { useState } from 'react'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/components/auth/auth-provider'
import { useBookmarks } from '@/hooks/use-wallet-data'
import { cacheBookmarkUsername, removeCachedBookmarkUsername } from '@/lib/bookmark-labels'
import { addBookmark, removeBookmark } from '@/services/bookmark/bookmark'
import { cn } from '@/lib/utils'

export function BookmarkButton({ targetUserId, username }: { targetUserId: string; username?: string }) {
  const t = useTranslations('bookmark')
  const { identity } = useAuth()
  const { bookmarks, mutate } = useBookmarks()
  const [loading, setLoading] = useState(false)
  const saved = bookmarks.some((item) => item.targetUserId === targetUserId)

  const toggle = async () => {
    setLoading(true)
    if (saved) {
      await removeBookmark(identity, targetUserId)
      removeCachedBookmarkUsername(targetUserId)
    } else {
      await addBookmark(identity, targetUserId)
      if (username) cacheBookmarkUsername(targetUserId, username)
    }
    await mutate()
    setLoading(false)
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      accessibilityLabel={saved ? t('remove') : t('add')}
      className={cn('size-11 rounded-full', saved ? 'bg-primary' : '')}
      disabled={loading}
      onPress={() => void toggle()}
    >
      {loading ? (
        <Spinner />
      ) : (
        <AppIcon name={saved ? 'favorite' : 'bookmark'} size={18} onColor={saved} />
      )}
    </Button>
  )
}
