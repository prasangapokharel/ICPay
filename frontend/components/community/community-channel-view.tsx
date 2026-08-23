"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { CommunityIcon } from "@/components/community/community-icon"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { CommunityChannelInfo } from "@/components/community/community-channel-info"
import { CommunityComposer } from "@/components/community/community-composer"
import {
  CommunityCopyMenuItem,
  CommunityShareMenuItem,
} from "@/components/community/community-share-link"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
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

  const handleJoinClick = () => {
    setJoinErr(null)
    if (isCommunityPaid(channel.access)) {
      setShowJoinConfirm(true)
    } else {
      void handleJoin()
    }
  }

  const handleJoin = async () => {
    setJoinBusy(true)
    setJoinErr(null)
    const err = await onJoin()
    setJoinBusy(false)
    if (err) {
      setJoinErr(err)
    } else {
      setShowJoinConfirm(false)
    }
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
          "relative z-10 mx-2 mt-2 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm",
          onWallpaper && "bg-background/95 backdrop-blur-md"
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
            <CommunityIcon name="back" size={20} />
          </Button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            onClick={() => setInfoOpen(true)}
          >
            <CommunityAvatar
              seed={channel.slug}
              name={channel.name}
              size="default"
              className="size-10 shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                {channel.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
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
              <CommunityIcon name="more" size={18} />
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
          <div className="flex items-center gap-2 border-t border-border/40 px-4 py-1.5">
            <CommunityIcon name="pin" size={14} className="shrink-0 text-primary" />
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {pinnedPreview.text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__|_/g, '').replace(/~~/g, '').replace(/`/g, '')}
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
          <div className="relative z-10 shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
            <Button
              className="h-12 w-full rounded-full text-base font-semibold shadow-lg"
              disabled={joinBusy}
              onClick={handleJoinClick}
            >
              {joinBusy
                ? t("joining")
                : isCommunityPaid(channel.access)
                  ? t("payToJoin", { price: formatCommunityPriceE8s(channel.priceE8s) })
                  : t("join")}
            </Button>
            {joinErr && !isCommunityPaid(channel.access) && (
              <p className="mt-2 text-center text-xs text-destructive">{joinErr}</p>
            )}
          </div>
        )}
      </div>

      {isOwner && canRead && (
        <div className="relative z-10 shrink-0">
          <CommunityComposer onPost={onPost} />
        </div>
      )}

      <Drawer open={showJoinConfirm} onOpenChange={setShowJoinConfirm} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <div className="mb-1 flex justify-center">
              <CommunityAvatar
                seed={channel.slug}
                name={channel.name}
                className="size-14"
                pixelSize={128}
              />
            </div>
            <DrawerTitle className="text-center">{channel.name}</DrawerTitle>
            <DrawerDescription className="text-center">
              {t("confirmJoinPrice", {
                name: channel.name,
                price: formatCommunityPriceE8s(channel.priceE8s),
              })}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="gap-2">
            <Button
              className="h-12 w-full rounded-full text-base font-semibold"
              disabled={joinBusy}
              onClick={() => void handleJoin()}
            >
              {joinBusy
                ? t("joining")
                : t("payToJoin", { price: formatCommunityPriceE8s(channel.priceE8s) })}
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full"
              onClick={() => setShowJoinConfirm(false)}
              disabled={joinBusy}
            >
              {t("cancel")}
            </Button>
            {joinErr && <p className="text-center text-xs text-destructive">{joinErr}</p>}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
