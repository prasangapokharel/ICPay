"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { CommunityEmptyPane } from "@/components/community/community-empty-pane"
import { CommunityWorkspace } from "@/components/community/community-workspace"
import { ChannelsPublicDirectory } from "@/components/community/channels-public-directory"
import { AppShell } from "@/components/layout/app-shell"
import { Spinner } from "@/components/ui/spinner"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"

export function ChannelsIndexView({ channels }: { channels: CommunityChannelSnapshot[] }) {
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
          <CommunityEmptyPane />
        </CommunityWorkspace>
      </AppShell>
    )
  }

  return <ChannelsPublicDirectory channels={channels} />
}
