"use client"

import { useTranslations } from "next-intl"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { CommunityWallpaperPicker } from "@/components/community/community-wallpaper-picker"
import {
  CommunityCopyLinkButton,
  CommunityShareLinkButton,
} from "@/components/community/community-share-link"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/ui/useMobile"
import { formatCommunityPriceE8s, formatLastActive } from "@/lib/community/format"
import {
  isCommunityOpen,
  isCommunityPaid,
  ownerHandle,
  type CommunityChannelPublic,
} from "@/services/community/community"

export function CommunityChannelInfo({
  channel,
  slug,
  open,
  onOpenChange,
  isOwner,
  lastActiveNs,
  onCopyLink,
  onCopyInvite,
}: {
  channel: CommunityChannelPublic
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isOwner: boolean
  lastActiveNs?: bigint
  onCopyLink: () => Promise<void>
  onCopyInvite?: () => Promise<void>
}) {
  const t = useTranslations("community")
  const isMobile = useIsMobile()
  const channelUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/channels/${encodeURIComponent(slug)}`
      : `icpay.app/channels/${slug}`
  const bio = channel.bio.trim()

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="max-h-[min(100dvh,720px)] sm:max-h-none">
        <DrawerHeader className="items-center gap-3 pb-2 text-center sm:items-start sm:text-left">
          <CommunityAvatar
            seed={slug}
            name={channel.name}
            className="size-16 shadow-sm ring-4 ring-background"
          />
          <div className="min-w-0 space-y-0.5">
            <DrawerTitle className="text-lg font-semibold">{channel.name}</DrawerTitle>
            <DrawerDescription className="text-sm">@{slug}</DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {bio ? (
            <div className="mb-4 rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">{t("bio")}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{bio}</p>
            </div>
          ) : null}

          <CommunityWallpaperPicker slug={slug} />

          <div className="space-y-2">
            <MetaRow label={t("createdBy")} value={ownerHandle(channel)} />
            <MetaRow label={t("membersLabel")} value={channel.memberCount.toString()} />
            <MetaRow
              label={t("visibility")}
              value={isCommunityOpen(channel.visibility) ? t("public") : t("private")}
            />
            <MetaRow
              label={t("access")}
              value={
                isCommunityPaid(channel.access)
                  ? `${formatCommunityPriceE8s(channel.priceE8s)} ICP`
                  : t("free")
              }
            />
            {lastActiveNs != null && (
              <MetaRow label={t("lastActive")} value={formatLastActive(lastActiveNs)} />
            )}
          </div>

          <div className="mt-4 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("channelLink")}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">{channelUrl}</p>
          </div>
        </div>

        <DrawerFooter className="gap-2 border-t border-border/50 pt-4">
          <CommunityShareLinkButton onCopy={onCopyLink} />
          {isOwner && onCopyInvite && (
            <CommunityCopyLinkButton onCopy={onCopyInvite} label={t("copyInviteLink")} />
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}
