"use client"

import { useTranslations } from "next-intl"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { CommunityChannelAvatarPicker } from "@/components/community/community-channel-avatar-picker"
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
  onAvatarSave,
  onAvatarRemove,
}: {
  channel: CommunityChannelPublic
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isOwner: boolean
  lastActiveNs?: bigint
  onCopyLink: () => Promise<void>
  onCopyInvite?: () => Promise<void>
  onAvatarSave?: (bytes: Uint8Array) => Promise<string | null>
  onAvatarRemove?: () => Promise<string | null>
}) {
  const t = useTranslations("community")
  const isMobile = useIsMobile()
  const channelUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/channels/${encodeURIComponent(slug)}`
      : `icpay.app/channels/${slug}`
  const bio = channel.bio.trim()
  const members = channel.memberCount.toString()

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="max-h-[min(100dvh,720px)] sm:max-h-none">
        <DrawerHeader className="items-center gap-3 border-b border-border/40 pb-4 text-center">
          <CommunityAvatar
            seed={channel.slug}
            name={channel.name}
            slug={channel.slug}
            className="size-20 shadow-sm ring-4 ring-background"
            pixelSize={160}
          />
          <div className="min-w-0 space-y-1">
            <DrawerTitle className="text-xl font-bold text-foreground">{channel.name}</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {t("membersCount", { count: members })}
            </DrawerDescription>
            <p className="text-xs text-muted-foreground">@{slug}</p>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {bio ? (
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("bio")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{bio}</p>
            </div>
          ) : null}

          {onAvatarSave && onAvatarRemove && (
            <CommunityChannelAvatarPicker
              channel={channel}
              isOwner={isOwner}
              onSave={onAvatarSave}
              onRemove={onAvatarRemove}
            />
          )}

          <CommunityWallpaperPicker slug={slug} />

          <div className="mt-4 divide-y divide-border/50 rounded-xl border border-border/50">
            <MetaRow label={t("createdBy")} value={ownerHandle(channel)} />
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

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("channelLink")}
            </p>
            <p className="mt-1.5 truncate text-sm font-medium text-primary">{channelUrl}</p>
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
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
