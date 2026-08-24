"use client"

import { CommunityWorkspace } from "@/components/community/community-workspace"

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CommunityWorkspace>{children}</CommunityWorkspace>
    </div>
  )
}
