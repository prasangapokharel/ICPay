"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ImageAdd02Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { BucketCard } from "@/components/bucket/bucket-card"
import { BucketCreateForm } from "@/components/bucket/bucket-create-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useBucketList, useInvalidateBucketCache } from "@/hooks/use-bucket"
import { useRefreshWallet } from "@/hooks/use-wallet-data"
import { createBucket } from "@/services/bucket/bucket"

export default function BucketPage() {
  const t = useTranslations("bucket")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()
  const { buckets, isLoading, refresh } = useBucketList()
  const [showForm, setShowForm] = useState(false)

  const handleCreate = async (
    name: string,
    capacityGB: number,
    visibility: Parameters<typeof createBucket>[3]
  ): Promise<string | null> => {
    const result = await createBucket(identity, name, capacityGB, visibility)
    if ("err" in result) return result.err
    refreshWallet()
    await Promise.all([refresh(), invalidateBucketCache()])
    router.push(`/bucket/${encodeURIComponent(result.ok)}`)
    return null
  }

  if (showForm) {
    return (
      <div className="space-y-6 pt-2">
        <BucketBackButton onClick={() => setShowForm(false)} />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("formTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("formSubtitle")}</p>
        </div>
        <BucketCreateForm onCreate={handleCreate} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <Button variant="link" size="sm" className="mt-1 h-auto px-0 text-xs" nativeButton={false} render={<Link href="/bucket/docs" />}>
          {t("docs")}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 p-4 text-left transition-colors hover:bg-muted/40 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/40"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={ImageAdd02Icon} className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">{t("createCta")}</span>
          <span className="block text-xs font-medium text-muted-foreground">{t("createCtaBody")}</span>
        </span>
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t("myBuckets")}</p>
        {isLoading && buckets.length === 0 ? (
          <div className="space-y-2 rounded-2xl border p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : buckets.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
            {t("empty")}
            <span className="mt-1 block">{t("emptyHint")}</span>
          </p>
        ) : (
          <div className="divide-y overflow-hidden rounded-2xl border">
            {buckets.map((bucket) => (
              <BucketCard key={bucket.id} bucket={bucket} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
