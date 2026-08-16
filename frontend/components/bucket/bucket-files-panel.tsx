"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { BucketFileRow } from "@/components/bucket/bucket-file-row"
import { BucketFilePagination } from "@/components/bucket/bucket-file-pagination"
import { BucketFilePreviewModal } from "@/components/bucket/bucket-file-preview-modal"
import { useBucketFiles, useBucketStats } from "@/hooks/use-bucket"
import type { FileListPage, FilePublic } from "@/services/bucket/types"

export function BucketFilesPanel({
  bucketId,
  canWrite,
  onDelete,
}: {
  bucketId: string
  canWrite: boolean
  onDelete: (path: string) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const [page, setPage] = useState(0)
  const [previewFile, setPreviewFile] = useState<FilePublic | null>(null)
  const { files, total, totalPages, isLoading, refresh: refreshFiles } = useBucketFiles(
    bucketId,
    page
  )
  const { refresh: refreshStats } = useBucketStats(bucketId)

  const removeFileFromCache = async (path: string) => {
    await refreshFiles(
      (current: FileListPage | undefined) => {
        if (!current) return current
        const items = current.items.filter((f) => f.path !== path)
        const total = current.total > 0n ? current.total - 1n : 0n
        return { ...current, items, total }
      },
      { revalidate: false }
    )
    void refreshStats()
  }

  const handleDelete = async (path: string) => {
    const err = await onDelete(path)
    if (!err) await removeFileFromCache(path)
    return err
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("files")}</p>
      {isLoading && files.length === 0 ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            {t("noFiles")}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card size="sm" className="min-w-0 overflow-hidden py-0">
            <CardContent className="divide-y p-0">
            {files.map((file) => (
              <BucketFileRow
                key={file.id}
                bucketId={bucketId}
                file={file}
                canWrite={canWrite}
                onDelete={handleDelete}
                onPreview={setPreviewFile}
              />
            ))}
            </CardContent>
          </Card>
          <BucketFilePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      <BucketFilePreviewModal
        bucketId={bucketId}
        file={previewFile}
        canWrite={canWrite}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
        onDelete={handleDelete}
        onDeleted={() => setPreviewFile(null)}
      />
    </div>
  )
}
