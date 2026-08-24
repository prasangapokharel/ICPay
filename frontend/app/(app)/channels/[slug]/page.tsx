import { Suspense } from "react"
import { CommunityChannelScreen } from "./community-channel-screen"
import { Spinner } from "@/components/ui/spinner"

export const instant = false

export function generateStaticParams() {
  return [{ slug: "slug" }]
}

export default function CommunityChannelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 flex-1 items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <CommunityChannelScreen />
    </Suspense>
  )
}
