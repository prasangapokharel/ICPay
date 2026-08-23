import { Suspense } from "react"
import { CommunityJoinScreen } from "./community-join-screen"
import { Spinner } from "@/components/ui/spinner"

export const instant = false

export function generateStaticParams() {
  return [{ slug: "slug" }]
}

export default function CommunityJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <CommunityJoinScreen />
    </Suspense>
  )
}
