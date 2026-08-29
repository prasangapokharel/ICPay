"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityIcon } from "@/components/community/community-icon"
import { CommunityMessageSearch } from "@/components/community/community-message-search"
import { TipDrawer } from "@/components/icpverse/tip-drawer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/ui/utils"
import type { CommunityMessagePublic } from "@/services/community/community"

export function CommunityMemberBar({
  messages,
  ownerUsername,
  senderUsername,
  balance,
  onTip,
  onSelectMessage,
  onWallpaper = false,
  isJoined = true,
  onJoin,
  joinBusy = false,
  joinLabel,
  joinErr,
}: {
  messages: CommunityMessagePublic[]
  ownerUsername?: string
  senderUsername?: string
  balance?: bigint
  onTip?: (amount: bigint, memo?: string) => Promise<string | null>
  onSelectMessage: (messageId: bigint) => void
  onWallpaper?: boolean
  isJoined?: boolean
  onJoin?: () => void
  joinBusy?: boolean
  joinLabel?: string
  joinErr?: string | null
}) {
  const t = useTranslations("community")
  const [searchOpen, setSearchOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const canTip = isJoined && Boolean(ownerUsername && onTip)
  const canSearch = isJoined || messages.length > 0

  return (
    <>
      <div
        className={cn(
          "relative z-10 flex shrink-0 items-center gap-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
          onWallpaper && "bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("tipCreator")}
          disabled={!canTip}
          onClick={() => setTipOpen(true)}
          className={cn(
            "size-11 shrink-0 rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-md",
            !canTip && "opacity-40"
          )}
        >
          <CommunityIcon name="gift" size={20} />
        </Button>

        {isJoined ? (
          <div
            className={cn(
              "flex h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-border/50 px-4 text-sm font-medium text-foreground shadow-sm",
              onWallpaper ? "bg-background/90 backdrop-blur-md" : "bg-muted/60"
            )}
          >
            {t("joined")}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Button
              type="button"
              disabled={joinBusy || !onJoin}
              onClick={onJoin}
              className={cn(
                "h-11 w-full rounded-full border border-transparent px-4 text-sm font-semibold shadow-sm",
                onWallpaper && "backdrop-blur-md"
              )}
            >
              {joinBusy ? t("joining") : (joinLabel ?? t("join"))}
            </Button>
            {joinErr ? (
              <p className="px-1 text-center text-xs text-destructive">{joinErr}</p>
            ) : null}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("searchMessages")}
          disabled={!canSearch}
          onClick={() => setSearchOpen(true)}
          className={cn(
            "size-11 shrink-0 rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-md",
            !canSearch && "opacity-40"
          )}
        >
          <CommunityIcon name="search" size={20} />
        </Button>
      </div>

      <CommunityMessageSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        messages={messages}
        onSelect={onSelectMessage}
      />

      {canTip && ownerUsername && onTip && (
        <TipDrawer
          open={tipOpen}
          onOpenChange={setTipOpen}
          username={ownerUsername}
          senderUsername={senderUsername}
          balance={balance}
          onTip={onTip}
        />
      )}
    </>
  )
}
