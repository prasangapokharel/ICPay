"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  BookOpen01Icon,
  Copy01Icon,
  Key01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { BucketUsageBar } from "@/components/bucket/bucket-card"
import { BucketFilesPanel } from "@/components/bucket/bucket-files-panel"
import { BucketUploadZone } from "@/components/bucket/bucket-upload-zone"
import { BucketRenewDrawer } from "@/components/bucket/bucket-renew-drawer"
import { BucketApiKeysModal } from "@/components/bucket/bucket-api-keys-modal"
import { BucketIconAction } from "@/components/bucket/bucket-icon-action"
import {
  useBucketStats,
  useInvalidateBucketCache,
} from "@/hooks/use-bucket"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/use-wallet-data"
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
import { copyText } from "@/lib/wallet-utils"
import {
  type BucketUrlMode,
  resolvePublicFileUrl,
  toRawCanisterUrl,
} from "@/lib/bucket/cdn"
import { cn } from "@/lib/utils"
import { useRewrittenLastSegment } from "@/lib/rewritten-route"

export function BucketDetail() {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()

  const bucketId = useRewrittenLastSegment()

  const { stats, isLoading: statsLoading, refresh: refreshStats } = useBucketStats(bucketId || null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [cdnOpen, setCdnOpen] = useState(false)
  const [urlMode, setUrlMode] = useState<BucketUrlMode>("raw")
  const [baseCopied, setBaseCopied] = useState(false)

  const active = stats ? isBucketActive(stats.status) : false
  const canWrite = active

  const refreshAfterUpload = async () => {
    await Promise.all([refreshStats(), invalidateBucketCache()])
  }

  const back = <BucketBackButton onClick={() => router.push("/bucket")} />

  const docsLink = (
    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" nativeButton={false} render={<Link href="/bucket/docs" />}>
      <HugeiconsIcon icon={BookOpen01Icon} className="size-3.5" strokeWidth={1.75} />
      {t("docs")}
    </Button>
  )

  if (!bucketId || (statsLoading && !stats)) {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          {back}
          {docsLink}
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
          {docsLink}
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
  const rawBase = publicBaseRaw ? toRawCanisterUrl(publicBaseRaw) : null
  const displayBase = rawBase ? resolvePublicFileUrl(rawBase, urlMode) : null

  const handleCopyBase = async () => {
    if (!displayBase) return
    await copyText(displayBase)
    setBaseCopied(true)
    setTimeout(() => setBaseCopied(false), 2000)
  }

  const statusBadge = active ? (
    stats.isExpiringSoon ? (
      <Badge variant="secondary" className="h-7 shrink-0 rounded-md px-2 text-[10px]">
        {t("expiringSoon")}
      </Badge>
    ) : (
      <Badge variant="outline" className="h-7 shrink-0 rounded-md px-2 text-[10px]">
        {t("active")}
      </Badge>
    )
  ) : (
    <Badge variant="destructive" className="h-7 shrink-0 rounded-md px-2 text-[10px]">
      {t("expired")}
    </Badge>
  )

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between gap-2">
        {back}
        {docsLink}
      </div>

      <div className="space-y-2.5 rounded-2xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">{stats.name}</h1>
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
          <div className="flex shrink-0 items-center gap-1">
            {statusBadge}
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2.5 text-xs"
              onClick={() => setApiKeysOpen(true)}
            >
              <HugeiconsIcon icon={Key01Icon} className="size-3.5" strokeWidth={1.75} />
              {t("apiKeysShort")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setRenewOpen(true)}
            >
              {t("renew")}
            </Button>
          </div>
        </div>

        <BucketUsageBar
          used={stats.storageUsed}
          capacity={stats.capacity}
          percent={stats.usagePercent}
        />

        {rawBase && (
          <Collapsible open={cdnOpen} onOpenChange={setCdnOpen}>
            <CollapsibleTrigger
              className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{t("publicCdn")}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-3.5 shrink-0 transition-transform", cdnOpen && "rotate-180")}
                strokeWidth={1.75}
              />
            </CollapsibleTrigger>
            <CollapsibleContent
              keepMounted
              className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
            >
              <div className="space-y-1.5 pt-1.5">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={urlMode === "cdn" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setUrlMode("cdn")}
                  >
                    {t("urlModeCdn")}
                  </Button>
                  <Button
                    type="button"
                    variant={urlMode === "raw" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setUrlMode("raw")}
                  >
                    {t("urlModeRaw")}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <p className="min-w-0 flex-1 truncate rounded-lg bg-muted/40 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
                    {displayBase}
                  </p>
                  <BucketIconAction
                    icon={baseCopied ? Tick02Icon : Copy01Icon}
                    label={baseCopied ? tc("copied") : tc("copy")}
                    variant="outline"
                    onClick={handleCopyBase}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {!canWrite && (
        <Alert className="py-2">
          <AlertDescription className="text-xs">{t("readOnly")}</AlertDescription>
        </Alert>
      )}

      <BucketUploadZone disabled={!canWrite} onUpload={handleUpload} />

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
    </div>
  )
}
