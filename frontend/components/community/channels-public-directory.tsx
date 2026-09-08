import Link from "next/link"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { channelPath } from "@/lib/community/seo"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"
import { ownerHandle } from "@/services/community/community"

export function ChannelsPublicDirectory({
  channels,
}: {
  channels: CommunityChannelSnapshot[]
}) {
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b border-border/40 bg-background">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-sm font-semibold tracking-tight hover:text-primary">
            ICPay
          </Link>
          <Link
            href="/login?next=%2Fchannels"
            className="text-sm font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-8">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">ICP Communities</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Public channels on the Internet Computer. Join with Internet Identity — no seed phrase.
          </p>
        </header>

        {channels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public channels yet.</p>
        ) : (
          <ul className="divide-y divide-border/50 rounded-xl border border-border/50 bg-background">
            {channels.map((ch) => {
              const bio = ch.bio.trim()
              return (
                <li key={ch.slug}>
                  <Link
                    href={channelPath(ch.slug)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <CommunityAvatar
                      seed={ch.slug}
                      name={ch.name}
                      slug={ch.slug}
                      size="default"
                      className="size-11 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">@{ch.slug}</p>
                      {bio ? (
                        <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{bio}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ch.memberCount} members · {ownerHandle(ch)}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
