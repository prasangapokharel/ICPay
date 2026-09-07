"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { Button } from "@/components/ui/button"
import { formatCommunityPriceE8s } from "@/lib/community/format"
import { channelPath } from "@/lib/community/seo"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"
import {
  isCommunityOpen,
  isCommunityPaid,
  ownerHandle,
} from "@/services/community/community"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import Image from "next/image"

export function ChannelPublicLanding({
  slug,
  channel,
  avatarBytes,
}: {
  slug: string
  channel: CommunityChannelSnapshot | null
  avatarBytes?: Uint8Array
}) {
  const t = useTranslations("community")

  if (!channel) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
        <Image src={APP_LOGO} alt={APP_LOGO_ALT} title={APP_LOGO_ALT} width={48} height={48} className="opacity-60" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Channel not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This channel does not exist or the link is incorrect.
          </p>
        </div>
        <Button variant="default" nativeButton={false} render={<Link href="/login" />}>
          Sign in to ICPay
        </Button>
      </div>
    )
  }

  const bio = channel.bio.trim()
  const members = channel.memberCount
  const owner = ownerHandle(channel)
  const listed = isCommunityOpen(channel.visibility)
  const paid = isCommunityPaid(channel.access)
  const loginNext = `/login?next=${encodeURIComponent(channelPath(slug))}`

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3.5 sm:px-6">
          <Image src={APP_LOGO} alt={APP_LOGO_ALT} title={APP_LOGO_ALT} width={28} height={28} className="shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">ICPay Channels</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <article className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CommunityAvatar
              seed={channel.slug}
              name={channel.name}
              slug={channel.slug}
              previewBytes={avatarBytes}
              className="size-20 shadow-sm ring-4 ring-background sm:size-24"
              pixelSize={160}
            />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">@{channel.slug}</p>
            </div>
          </div>

          {bio ? (
            <p className="text-center text-sm leading-relaxed text-foreground/90 sm:text-base">{bio}</p>
          ) : (
            <p className="text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join {channel.name} on ICPay — a community channel on the Internet Computer.
            </p>
          )}

          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm sm:gap-4 sm:p-5">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Members</dt>
              <dd className="font-semibold tabular-nums text-foreground">{t("membersCount", { count: members })}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Host</dt>
              <dd className="font-semibold text-foreground">{owner}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Access</dt>
              <dd className="font-semibold text-foreground">
                {paid ? `${formatCommunityPriceE8s(BigInt(channel.priceE8s))} ICP` : "Free"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Visibility</dt>
              <dd className="font-semibold text-foreground">{listed ? "Public" : "Invite only"}</dd>
            </div>
          </dl>
        </article>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={loginNext} />}
          >
            {listed ? "Join with Internet Identity" : "Sign in to request access"}
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            No seed phrase · Internet Computer wallet · Username payments
          </p>
        </div>
      </main>
    </div>
  )
}
