"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookmarkAdd01Icon, BookmarkRemove01Icon, ArrowUpRight01Icon, InboxIcon } from "@hugeicons/core-free-icons"
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
import { useAuth } from "@/components/auth/auth-provider"
import { addBookmark, removeBookmark } from "@/services/bookmark/bookmark"
import { useBookmarks } from "@/hooks/use-wallet-data"

// Opens a drawer listing all bookmarked users. Tapping a row fills the
// transfer recipient (via the onSelect callback) and closes.
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
    mutate()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-0.5 px-4 pb-6">
          {bookmarks.length === 0 ? (
            <div className="py-10 text-center">
              <HugeiconsIcon icon={InboxIcon} className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">{t("empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <BookmarkRow
                key={bm.targetUserId}
                targetUserId={bm.targetUserId}
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

// Inline button for adding/removing a bookmark from a user's public profile.
export function BookmarkButton({
  targetUserId,
  username,
}: {
  targetUserId: string
  username: string
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
    } else {
      await addBookmark(identity, targetUserId)
    }
    mutate()
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-1.5 rounded-full"
      aria-label={isBookmarked ? t("remove") : t("add")}
    >
      <HugeiconsIcon
        icon={isBookmarked ? BookmarkRemove01Icon : BookmarkAdd01Icon}
        className="size-3.5"
      />
      {isBookmarked ? t("remove") : t("add")}
    </Button>
  )
}

function BookmarkRow({
  targetUserId,
  onSelect,
  onRemove,
  onClose,
}: {
  targetUserId: string
  onSelect?: (username: string) => void
  onRemove: () => void
  onClose: () => void
}) {
  const t = useTranslations("bookmark")
  // targetUserId may be a username or a raw id; show what we have.
  const display = targetUserId.startsWith("@") ? targetUserId.slice(1) : targetUserId

  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-muted/50">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="bg-muted text-xs font-medium uppercase">
          {display.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-semibold">
          @{display}
          <PremiumBadge name={display} className="size-3" />
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onSelect && (
          <Button
            variant="default"
            size="sm"
            className="h-7 rounded-full text-xs"
            onClick={() => { onSelect(display); onClose() }}
          >
            {t("sendTo", { name: display })}
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <HugeiconsIcon icon={BookmarkRemove01Icon} className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
