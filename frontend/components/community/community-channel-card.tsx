"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { formatCommunityPriceE8s, formatLastActive } from "@/lib/community/format"
import { cn } from "@/lib/ui/utils"
import {
  isCommunityOpen,
  isCommunityPaid,
  type CommunityChannelPublic,
} from "@/services/community/community"

export function CommunityChannelCard({
  channel,
  href,
  isOwner = false,
  isJoined = false,
  joining = false,
  selected = false,
  unread = false,
  lastActiveNs,
  onJoin,
}: {
  channel: CommunityChannelPublic
  href: string
  isOwner?: boolean
  isJoined?: boolean
  joining?: boolean
  selected?: boolean
  unread?: boolean
  lastActiveNs?: bigint
  onJoin?: () => void
}) {
  const t = useTranslations("community")
  const paid = isCommunityPaid(channel.access)
  const members = channel.memberCount.toString()
  const showJoin = !isOwner && !isJoined && onJoin
  const metaParts = [
    paid ? `${formatCommunityPriceE8s(channel.priceE8s)} ICP` : null,
    t("membersCount", { count: members }),
    lastActiveNs != null ? formatLastActive(lastActiveNs) : null,
    !isCommunityOpen(channel.visibility) ? t("private") : null,
  ].filter(Boolean)

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 transition-colors",
        selected && "bg-muted/50 md:bg-muted/40"
      )}
    >
      <Link href={href} prefetch className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <CommunityAvatar
            seed={channel.slug}
            name={channel.name}
            size="default"
            className="size-11"
          />
          {unread && (
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-background"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{channel.name}</p>
          <p className="truncate text-xs text-muted-foreground">{metaParts.join(" · ")}</p>
        </div>
      </Link>

      {isOwner ? null : isJoined ? (
        <span className="shrink-0 px-2 text-xs font-medium text-muted-foreground">
          {t("joined")}
        </span>
      ) : showJoin ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={joining}
          className="h-8 shrink-0 rounded-full border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/15 hover:text-primary"
          onClick={() => onJoin?.()}
        >
          {joining ? t("gettingIn") : t("getIn")}
        </Button>
      ) : null}
    </div>
  )
}
