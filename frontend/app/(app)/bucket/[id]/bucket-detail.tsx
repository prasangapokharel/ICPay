"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Folder02Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPage } from "@/components/layout/dashboard/app-page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { BucketFilesPanel } from "@/components/bucket/bucket-files-panel"
import { BucketFolderDialog } from "@/components/bucket/bucket-folder-dialog"
import { BucketUploadControl } from "@/components/bucket/bucket-upload-control"
import { BucketRenewDrawer } from "@/components/bucket/bucket-renew-drawer"
import { BucketApiKeysModal } from "@/components/bucket/bucket-api-keys-modal"
import {
  useBucketStats,
  useInvalidateBucketCache,
} from "@/hooks/bucket/useBucket"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import {
  deleteFile,
  bulkDeleteFiles,
  renewBucket,
  uploadFile,
  createFolder,
  deleteFolder,
} from "@/services/bucket/bucket"
import { isBucketActive } from "@/lib/bucket/bucket"
import { joinObjectPath, nestedPrefix, prefixSegments, apiListFolderPrefix } from "@/lib/bucket/folderPath"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function BucketDetail() {
  const t = useTranslations("bucket")
  const tNav = useTranslations("settings.sections")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()
  const { mutate } = useSWRConfig()

  const bucketId = useRewrittenLastSegment()
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useBucketStats(bucketId || null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [prefix, setPrefix] = useState("")
  const [folderOpen, setFolderOpen] = useState(false)

  const active = stats ? isBucketActive(stats.status) : false
  const canWrite = active
  const crumbs = prefixSegments(prefix)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshFolderListing = useCallback(async () => {
    if (!identity || !bucketId) return
    const folderPrefix = apiListFolderPrefix(prefix)
    const principal = identity.getPrincipal().toText()
    await mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "bucket-files" &&
        key[1] === bucketId &&
        key[2] === folderPrefix &&
        key[key.length - 1] === principal
    )
    await refreshStats()
  }, [identity, bucketId, prefix, mutate, refreshStats])

  const scheduleRefreshAfterUpload = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      void refreshFolderListing()
    }, 300)
  }, [refreshFolderListing])

  const handleUpload = useCallback(
    async (
      file: File,
      path: string,
      contentType: string,
      onProgress?: (pct: number) => void
    ) => {
      const res = await uploadFile(identity, bucketId, path, file, onProgress, contentType)
      if ("err" in res) return res.err
      return null
    },
    [identity, bucketId]
  )

  const handleUploadSuccess = useCallback(() => {
    scheduleRefreshAfterUpload()
  }, [scheduleRefreshAfterUpload])

  const handleDelete = async (path: string) => {
    const res = await deleteFile(identity, bucketId, path)
    if ("err" in res) return res.err
    return null
  }

  const handleDeletePaths = async (paths: string[]) => {
    if (paths.length === 0) return null
    if (paths.length === 1) return handleDelete(paths[0])
    const res = await bulkDeleteFiles(identity, bucketId, paths)
    if ("err" in res) return res.err
    return null
  }

  const handleDeleteFolders = async (paths: string[]) => {
    for (const path of paths) {
      const res = await deleteFolder(identity, bucketId, path)
      if ("err" in res) return res.err
    }
    await invalidateBucketCache()
    return null
  }

  const handleRenew = async () => {
    const res = await renewBucket(identity, bucketId)
    if ("err" in res) return res.err
    refreshWallet()
    await Promise.all([refreshStats(), invalidateBucketCache()])
    return null
  }

  const sep = (
    <BreadcrumbSeparator>
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={1.75} />
    </BreadcrumbSeparator>
  )

  const trail = (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/bucket" />}>{t("back")}</BreadcrumbLink>
        </BreadcrumbItem>
        {sep}
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="truncate">{stats?.name ?? t("files")}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              className="truncate"
              render={<button type="button" />}
              onClick={() => setPrefix("")}
            >
              {stats?.name ?? t("files")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((name, i) => {
          const last = i === crumbs.length - 1
          return (
            <span key={`${name}-${i}`} className="contents">
              {sep}
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage className="truncate">{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="truncate"
                    render={<button type="button" />}
                    onClick={() => setPrefix(`${crumbs.slice(0, i + 1).join("/")}/`)}
                  >
                    {name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )

  const headerActions = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canWrite ? (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setFolderOpen(true)}>
            <HugeiconsIcon icon={Folder02Icon} className="size-4" strokeWidth={1.75} />
            {t("createFolder")}
          </Button>
          <BucketUploadControl
            disabled={!canWrite}
            pathPrefix={prefix}
            onUpload={handleUpload}
            onSuccess={handleUploadSuccess}
          />
        </>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={tNav("more")} className="shrink-0" />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {stats ? (
            <>
              <DropdownMenuItem onClick={() => setApiKeysOpen(true)}>
                {t("apiKeysShort")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRenewOpen(true)}>
                {t("renew")}
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuItem onClick={() => router.push("/bucket/docs")}>
            {t("docs")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  if (!bucketId || (statsLoading && !stats)) {
    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
          {headerActions}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </AppPage>
    )
  }

  if (!stats) {
    return (
      <AppPage>
        <div className="flex items-center justify-between gap-2">
          {trail}
          {headerActions}
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </AppPage>
    )
  }

  return (
    <AppPage>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {trail}
        {headerActions}
      </div>

      {!canWrite && (
        <Alert>
          <AlertDescription>{t("readOnly")}</AlertDescription>
        </Alert>
      )}

      <BucketFilesPanel
        bucketId={bucketId}
        canWrite={canWrite}
        prefix={prefix}
        onPrefixChange={setPrefix}
        onDelete={handleDelete}
        onDeletePaths={handleDeletePaths}
        onDeleteFolders={handleDeleteFolders}
        onCreateFolder={() => setFolderOpen(true)}
      />

      <BucketFolderDialog
        open={folderOpen}
        onOpenChange={setFolderOpen}
        onCreate={async (name) => {
          const path = joinObjectPath(prefix, `${name}/`)
          const res = await createFolder(identity, bucketId, path)
          if ("err" in res) throw new Error(res.err)
          await refreshFolderListing()
          setPrefix(nestedPrefix(prefix, name))
        }}
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
    </AppPage>
  )
}
