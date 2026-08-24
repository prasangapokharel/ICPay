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
}: {
  messages: CommunityMessagePublic[]
  ownerUsername?: string
  senderUsername?: string
  balance?: bigint
  onTip?: (amount: bigint, memo?: string) => Promise<string | null>
  onSelectMessage: (messageId: bigint) => void
  onWallpaper?: boolean
}) {
  const t = useTranslations("community")
  const [searchOpen, setSearchOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const canTip = Boolean(ownerUsername && onTip)

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

        <div
          className={cn(
            "flex h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-border/50 px-4 text-sm font-medium text-foreground shadow-sm",
            onWallpaper ? "bg-background/90 backdrop-blur-md" : "bg-muted/60"
          )}
        >
          {t("joined")}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("searchMessages")}
          onClick={() => setSearchOpen(true)}
          className="size-11 shrink-0 rounded-full border border-border/50 bg-background/90 shadow-sm backdrop-blur-md"
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
