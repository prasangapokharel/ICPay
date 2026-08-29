"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { CommunityChannelScreen } from "@/app/(app)/channels/[slug]/community-channel-screen"
import { CommunityWorkspace } from "@/components/community/community-workspace"
import { ChannelPublicLanding } from "@/components/community/channel-public-landing"
import { AppShell } from "@/components/layout/app-shell"
import { Spinner } from "@/components/ui/spinner"
import type { CommunityChannelPublic } from "@/services/community/community"

export function ChannelSlugView({
  slug,
  channel,
}: {
  slug: string
  channel: CommunityChannelPublic | null
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <AppShell>
        <CommunityWorkspace>
          <CommunityChannelScreen />
        </CommunityWorkspace>
      </AppShell>
    )
  }

  return <ChannelPublicLanding slug={slug} channel={channel} />
}
