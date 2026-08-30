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
}: {
  slug: string
  channel: CommunityChannelSnapshot | null
}) {
  const t = useTranslations("community")

  if (!channel) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <Image src={APP_LOGO} alt={APP_LOGO_ALT} title={APP_LOGO_ALT} width={40} height={40} className="opacity-80" />
        <h1 className="text-lg font-semibold tracking-tight">Channel not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This channel does not exist or the link is wrong.
        </p>
        <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
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
    <div className="min-h-svh bg-muted/40">
      <header className="border-b border-border/40 bg-background">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
          <Image src={APP_LOGO} alt={APP_LOGO_ALT} title={APP_LOGO_ALT} width={28} height={28} />
          <span className="text-sm font-medium text-muted-foreground">ICPay Channels</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
        <article className="space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <CommunityAvatar
              seed={channel.slug}
              name={channel.name}
              slug={channel.slug}
              className="size-20 shadow-sm ring-4 ring-background"
              pixelSize={160}
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{channel.name}</h1>
              <p className="text-sm text-muted-foreground">@{channel.slug}</p>
            </div>
          </div>

          {bio ? (
            <p className="text-center text-sm leading-relaxed text-foreground/90">{bio}</p>
          ) : (
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Join {channel.name} on ICPay — a community channel on the Internet Computer.
            </p>
          )}

          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-background p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Members</dt>
              <dd className="font-semibold tabular-nums">{t("membersCount", { count: members })}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Host</dt>
              <dd className="font-semibold">{owner}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Access</dt>
              <dd className="font-semibold">
                {paid ? `${formatCommunityPriceE8s(BigInt(channel.priceE8s))} ICP` : "Free"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Visibility</dt>
              <dd className="font-semibold">{listed ? "Public" : "Invite only"}</dd>
            </div>
          </dl>
        </article>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={loginNext} />}
          >
            {listed ? "Join with Internet Identity" : "Sign in to request access"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No seed phrase · Internet Computer wallet · Username payments
          </p>
        </div>
      </main>
    </div>
  )
}
