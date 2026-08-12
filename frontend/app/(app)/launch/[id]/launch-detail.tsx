"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LaunchStatus } from "@/components/launch/launch-status"
import { useToken } from "@/hooks/use-launch-data"
import { useRewrittenLastSegment } from "@/lib/rewritten-route"

export function LaunchDetail() {
  const t = useTranslations("launch")
  const router = useRouter()

  const id = useRewrittenLastSegment()

  const { token, isLoading } = useToken(id || null)

  const back = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/launch")}
      className="-ml-2 h-auto px-2 py-1 text-muted-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      {t("back")}
    </Button>
  )

  // An empty id means the mid-transition frame above, so the loader is held
  // rather than asserting the token does not exist.
  if (isLoading || !id) {
    return (
      <div className="space-y-4 pt-2">
        {back}
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="space-y-4 pt-2">
        {back}
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      {back}
      <LaunchStatus token={token} />
    </div>
  )
}
