"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookmarkAdd01Icon,
  Bookmark02Icon,
  ArrowUpRight01Icon,
  InboxIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { avatarUriFor } from "@/lib/avatar"
import { optionalText } from "@/lib/bucket/bucket"
import {
  cacheBookmarkUsername,
  getCachedBookmarkUsername,
  removeCachedBookmarkUsername,
} from "@/lib/bookmark-labels"
import { useAuth } from "@/components/auth/auth-provider"
import { addBookmark, removeBookmark } from "@/services/bookmark/bookmark"
import { useBookmarks } from "@/hooks/use-wallet-data"
import type { Bookmark } from "@/services/types"
import { cn } from "@/lib/utils"

export function BookmarkDrawer({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect?: (username: string) => void
}) {
  const t = useTranslations("bookmark")
  const { identity } = useAuth()
  const { bookmarks, mutate } = useBookmarks()

  const handleRemove = async (targetUserId: string) => {
    await removeBookmark(identity, targetUserId)
    removeCachedBookmarkUsername(targetUserId)
    mutate()
  }

  const usable = bookmarks
    .map((bm) => ({ bm, username: bookmarkUsername(bm) }))
    .filter((row): row is { bm: Bookmark; username: string } => row.username !== null)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-0.5 px-4 pb-6">
          {usable.length === 0 ? (
            <div className="py-10 text-center">
              <HugeiconsIcon icon={InboxIcon} className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">{t("empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
            </div>
          ) : (
            usable.map(({ bm, username }) => (
              <BookmarkRow
                key={bm.targetUserId}
                username={username}
                onSelect={onSelect}
                onRemove={() => handleRemove(bm.targetUserId)}
                onClose={() => onOpenChange(false)}
              />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function BookmarkButton({
  targetUserId,
  username,
  className,
}: {
  targetUserId: string
  username: string
  className?: string
}) {
  const t = useTranslations("bookmark")
  const { identity } = useAuth()
  const { bookmarks, mutate } = useBookmarks()
  const [loading, setLoading] = useState(false)

  const isBookmarked = bookmarks.some((b) => b.targetUserId === targetUserId)

  const toggle = async () => {
    setLoading(true)
    if (isBookmarked) {
      await removeBookmark(identity, targetUserId)
      removeCachedBookmarkUsername(targetUserId)
    } else {
      await addBookmark(identity, targetUserId)
      cacheBookmarkUsername(targetUserId, username)
    }
    mutate()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={isBookmarked ? t("remove") : t("add")}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
        isBookmarked
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : (
        <HugeiconsIcon
          icon={isBookmarked ? Bookmark02Icon : BookmarkAdd01Icon}
          className="size-4"
          strokeWidth={1.75}
        />
      )}
    </button>
  )
}

function bookmarkUsername(bm: Bookmark): string | null {
  const fromApi = optionalText(bm.username)
  if (fromApi) return fromApi.toLowerCase()
  return getCachedBookmarkUsername(bm.targetUserId)
}

function BookmarkRow({
  username,
  onSelect,
  onRemove,
  onClose,
}: {
  username: string
  onSelect?: (username: string) => void
  onRemove: () => void
  onClose: () => void
}) {
  const t = useTranslations("bookmark")
  const tc = useTranslations("common")

  const pick = () => {
    if (!onSelect) return
    onSelect(username)
    onClose()
  }

  return (
    <div className="flex items-center gap-2.5 rounded-2xl px-1 py-2 hover:bg-muted/50">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        onClick={pick}
        disabled={!onSelect}
      >
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={avatarUriFor(username)} alt="" />
          <AvatarFallback className="bg-muted text-xs font-medium uppercase">
            {username.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <p className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold">
          @{username}
          <PremiumBadge name={username} className="size-3 shrink-0" />
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        {onSelect && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-muted-foreground"
            aria-label={t("sendTo", { name: username })}
            onClick={pick}
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" strokeWidth={1.75} />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={tc("close")}
          onClick={onRemove}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
