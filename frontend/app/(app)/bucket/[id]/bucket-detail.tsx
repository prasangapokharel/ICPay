"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import {
  BucketUploadDesktopTrigger,
  useBucketUploadDesktopOnly,
} from "@/components/bucket/bucket-upload-desktop-gate"
import { BucketUsageBar } from "@/components/bucket/bucket-card"
import { BucketFilesPanel } from "@/components/bucket/bucket-files-panel"
import { BucketUploadModal } from "@/components/bucket/bucket-upload-modal"
import { BucketRenewDrawer } from "@/components/bucket/bucket-renew-drawer"
import { BucketApiKeysModal } from "@/components/bucket/bucket-api-keys-modal"
import { BucketPublicCdn } from "@/components/bucket/bucket-public-cdn"
import {
  useBucketStats,
  useInvalidateBucketCache,
} from "@/hooks/bucket/useBucket"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import {
  deleteFile,
  renewBucket,
  uploadFile,
} from "@/services/bucket/bucket"
import {
  isBucketActive,
  isPublicVisibility,
  optionalText,
} from "@/lib/bucket/bucket"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function BucketDetail() {
  const t = useTranslations("bucket")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()

  const bucketId = useRewrittenLastSegment()
  const { desktopOnly } = useBucketUploadDesktopOnly()

  const { stats, isLoading: statsLoading, refresh: refreshStats } = useBucketStats(bucketId || null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)

  const active = stats ? isBucketActive(stats.status) : false
  const canWrite = active

  const refreshAfterUpload = async () => {
    await Promise.all([refreshStats(), invalidateBucketCache()])
  }

  const back = <BucketBackButton onClick={() => router.push("/bucket")} />

  const headerActions = (
    <ButtonGroup>
      {canWrite && (
        <BucketUploadDesktopTrigger>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (!desktopOnly) setUploadOpen(true)
            }}
          >
            {t("upload")}
          </Button>
        </BucketUploadDesktopTrigger>
      )}
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/bucket/docs" />}>
        {t("docs")}
      </Button>
    </ButtonGroup>
  )

  if (!bucketId || (statsLoading && !stats)) {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          {back}
          {headerActions}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          {back}
          {headerActions}
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleUpload = async (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => {
    const res = await uploadFile(identity, bucketId, path, file, onProgress, contentType)
    if ("err" in res) return res.err
    await refreshAfterUpload()
    return null
  }

  const handleDelete = async (path: string) => {
    const res = await deleteFile(identity, bucketId, path)
    if ("err" in res) return res.err
    return null
  }

  const handleRenew = async () => {
    const res = await renewBucket(identity, bucketId)
    if ("err" in res) return res.err
    refreshWallet()
    await refreshAfterUpload()
    return null
  }

  const publicBaseRaw = optionalText(stats.publicBaseUrl)

  const statusBadge = active ? (
    stats.isExpiringSoon ? (
      <Badge variant="secondary">{t("expiringSoon")}</Badge>
    ) : (
      <Badge variant="outline">{t("active")}</Badge>
    )
  ) : (
    <Badge variant="destructive">{t("expired")}</Badge>
  )

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between gap-2">
        {back}
        {headerActions}
      </div>

      <Card size="sm">
        <CardContent className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="min-w-0 truncate text-lg font-bold tracking-tight" title={stats.name}>
              {stats.name}
            </h1>
            <ButtonGroup className="shrink-0">
              <Button variant="outline" size="sm" onClick={() => setApiKeysOpen(true)}>
                {t("apiKeysShort")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRenewOpen(true)}>
                {t("renew")}
              </Button>
            </ButtonGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusBadge}
            <p className="text-xs text-muted-foreground">
              {isPublicVisibility(stats.visibility) ? t("public") : t("private")}
              {" · "}
              {Number(stats.fileCount)} {t("files")}
              {" · "}
              {active
                ? t("daysLeft", { days: String(stats.daysRemaining) })
                : t("readOnly")}
            </p>
          </div>
        </div>

        <BucketUsageBar
          used={stats.storageUsed}
          capacity={stats.capacity}
          percent={stats.usagePercent}
        />

        {publicBaseRaw && <BucketPublicCdn publicBaseUrl={publicBaseRaw} />}
        </CardContent>
      </Card>

      {!canWrite && (
        <Alert>
          <AlertDescription>{t("readOnly")}</AlertDescription>
        </Alert>
      )}

      <BucketFilesPanel
        bucketId={bucketId}
        canWrite={canWrite}
        onDelete={handleDelete}
      />

      <BucketRenewDrawer
        bucketId={bucketId}
        open={renewOpen}
        onOpenChange={setRenewOpen}
        onRenew={handleRenew}
      />

      <BucketApiKeysModal
        bucketId={bucketId}
        open={apiKeysOpen}
        onOpenChange={setApiKeysOpen}
      />

      <BucketUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        disabled={!canWrite}
        onUpload={handleUpload}
      />
    </div>
  )
}
