"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppIcon } from "@/components/ui/app-icon"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { BucketCard } from "@/components/bucket/bucket-card"
import { BucketCreateForm } from "@/components/bucket/bucket-create-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useBucketList, useInvalidateBucketCache } from "@/hooks/bucket/useBucket"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="link" size="sm" nativeButton={false} render={<Link href="/bucket/pricing" />}>
            {t("pricingLink")}
          </Button>
          <span className="text-muted-foreground/50">·</span>
          <Button variant="link" size="sm" nativeButton={false} render={<Link href="/bucket/docs" />}>
            {t("docs")}
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-auto w-full justify-start gap-3 border-dashed p-4"
        onClick={() => setShowForm(true)}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-800">
          <AppIcon name="bucket" size={20} />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-bold">{t("createCta")}</span>
          <span className="block text-xs font-medium text-muted-foreground">{t("createCtaBody")}</span>
        </span>
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t("myBuckets")}</p>
        {isLoading && buckets.length === 0 ? (
          <Card size="sm">
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : buckets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center text-xs text-muted-foreground">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gray-800">
                <AppIcon name="empty" size={24} />
              </span>
              {t("empty")}
              <span className="mt-1 block">{t("emptyHint")}</span>
            </CardContent>
          </Card>
        ) : (
          <Card size="sm" className="overflow-hidden py-0">
            <CardContent className="divide-y p-0">
            {buckets.map((bucket) => (
              <BucketCard key={bucket.id} bucket={bucket} />
            ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
