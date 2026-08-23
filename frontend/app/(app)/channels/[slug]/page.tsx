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
        <div className="flex justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <CommunityChannelScreen />
    </Suspense>
  )
}
