"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { CommunityChannelInfo } from "@/components/community/community-channel-info"
import { CommunityComposer } from "@/components/community/community-composer"
import {
  CommunityCopyMenuItem,
  CommunityShareMenuItem,
} from "@/components/community/community-share-link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyText } from "@/lib/wallet/utils"
import { formatCommunityPriceE8s } from "@/lib/community/format"
import { useCommunityWallpaper } from "@/hooks/community/useCommunityWallpaper"
import { cn } from "@/lib/ui/utils"
import {
  isCommunityOpen,
  isCommunityPaid,
  type CommunityChannelPublic,
  type CommunityMessagePublic,
} from "@/services/community/community"

export function CommunityChannelView({
  channel,
  slug,
  isOwner,
  isMember,
  inviteCode,
  pinnedPreview,
  lastActiveNs,
  onJoin,
  onLeave,
  onPost,
  messagesSlot,
}: {
  channel: CommunityChannelPublic
  slug: string
  isOwner: boolean
  isMember: boolean
  inviteCode?: string
  pinnedPreview?: CommunityMessagePublic
  lastActiveNs?: bigint
  onJoin: () => Promise<string | null>
  onLeave: () => Promise<string | null>
  onPost: (text: string) => Promise<string | null>
  messagesSlot: ReactNode
}) {
  const t = useTranslations("community")
  const [joinBusy, setJoinBusy] = useState(false)
  const [joinErr, setJoinErr] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const members = channel.memberCount.toString()
  const canRead =
    isOwner ||
    isMember ||
    (isCommunityOpen(channel.visibility) && !isCommunityPaid(channel.access))
  const needsJoin = !canRead
  const { wallpaperUrl } = useCommunityWallpaper(slug)
  const onWallpaper = Boolean(wallpaperUrl)

  const copyInvite = async () => {
    if (!inviteCode) return
    const url = `${window.location.origin}/channels/join/${encodeURIComponent(slug)}?code=${encodeURIComponent(inviteCode)}`
    await copyText(url)
  }

  const copyChannelLink = async () => {
    await copyText(`${window.location.origin}/channels/${encodeURIComponent(slug)}`)
  }

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      )}
    >
      <img
        aria-hidden
        src={wallpaperUrl}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-center"
        draggable={false}
      />

      <header
        className={cn(
          "relative z-10 shrink-0 rounded-4xl m-2 border-b backdrop-blur-xl",
          onWallpaper ? "border-white/15 bg-black/30" : "border-border/30 bg-background/40"
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 md:px-4">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href="/channels" />}
            aria-label={t("backAria")}
            className="shrink-0 md:hidden"
          >
            <AppIcon name="chatBack" size={20} mono />
          </Button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => setInfoOpen(true)}
          >
            <CommunityAvatar
              seed={slug}
              name={channel.name}
              size="default"
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-semibold leading-tight",
                  onWallpaper && "text-white drop-shadow-sm"
                )}
              >
                {channel.name}
              </p>
              <p
                className={cn(
                  "truncate text-xs",
                  onWallpaper ? "text-white/75" : "text-muted-foreground"
                )}
              >
                {isOwner
                  ? t("ownerChannel")
                  : isMember
                    ? `${t("joined")} · ${t("membersCount", { count: members })}`
                    : t("membersCount", { count: members })}
              </p>
            </div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("channelInfo")}
                  className="shrink-0"
                />
              }
            >
              <AppIcon name="chatMore" size={18} mono />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setInfoOpen(true)}>
                {t("channelInfo")}
              </DropdownMenuItem>
              <CommunityShareMenuItem onCopy={copyChannelLink} />
              {isOwner && inviteCode && (
                <CommunityCopyMenuItem onCopy={copyInvite} label={t("copyInviteLink")} />
              )}
              {isMember && !isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => void onLeave()}>
                    {t("leave")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {pinnedPreview && canRead && (
          <div
            className={cn(
              "flex items-center gap-2 border-t px-4 py-1.5",
              onWallpaper ? "border-white/15" : "border-border/30"
            )}
          >
            <AppIcon name="chatPin" size={14} mono className="shrink-0 opacity-80" />
            <p
              className={cn(
                "min-w-0 truncate text-xs",
                onWallpaper ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {pinnedPreview.text}
            </p>
          </div>
        )}
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {canRead ? (
          <div className="min-h-0 flex-1 overflow-hidden">{messagesSlot}</div>
        ) : (
          <div className="min-h-0 flex-1" />
        )}
        {needsJoin && (
          <div
            className="shrink-0 border-t border-border/60 bg-background/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md"
          >
            <p className="text-center text-sm text-muted-foreground">{t("joinToRead")}</p>
            {isCommunityPaid(channel.access) && (
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {t("joinPrice", { price: formatCommunityPriceE8s(channel.priceE8s) })}
              </p>
            )}
            <Button
              className="mt-3 w-full rounded-full"
              disabled={joinBusy}
              onClick={async () => {
                setJoinBusy(true)
                setJoinErr(null)
                const err = await onJoin()
                setJoinBusy(false)
                if (err) setJoinErr(err)
              }}
            >
              {joinBusy ? t("joining") : t("join")}
            </Button>
            {joinErr && <p className="mt-2 text-center text-xs text-destructive">{joinErr}</p>}
          </div>
        )}
      </div>

      {canRead && isMember && !isOwner && (
        <div className="relative z-10 m-2 shrink-0 rounded-full border border-border/40 bg-muted/50 px-4 py-2.5 text-center backdrop-blur-sm">
          <span className="text-sm font-medium text-muted-foreground">{t("joined")}</span>
        </div>
      )}

      {isOwner && canRead && (
        <div className="relative z-10 shrink-0">
          <CommunityComposer onPost={onPost} />
        </div>
      )}

      <CommunityChannelInfo
        channel={channel}
        slug={slug}
        open={infoOpen}
        onOpenChange={setInfoOpen}
        isOwner={isOwner}
        lastActiveNs={lastActiveNs}
        onCopyLink={copyChannelLink}
        onCopyInvite={inviteCode ? copyInvite : undefined}
      />
    </div>
  )
}
