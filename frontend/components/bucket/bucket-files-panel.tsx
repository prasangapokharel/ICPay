"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { BucketFilePagination } from "@/components/bucket/bucket-file-pagination"
import { BucketFilePreviewPane } from "@/components/bucket/bucket-file-preview-pane"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { BucketSelectBar } from "@/components/bucket/bucket-select-bar"
import { BucketFilesToolbar, type FileSortKey } from "@/components/bucket/bucket-files-toolbar"
import { BucketFilesTable, entryKey } from "@/components/bucket/bucket-files-table"
import { useBucketExplorerHotkeys } from "@/hooks/bucket/useBucketExplorerHotkeys"
import { useBucketFiles, useBucketSearch, useBucketStats } from "@/hooks/bucket/useBucket"
import {
  folderTotals,
  joinObjectPath,
  listFolderEntries,
  nestedPrefix,
  normalizePrefix,
  pathsUnderFolder,
} from "@/lib/bucket/folderPath"
import type { FileListPage, FilePublic } from "@/services/bucket/types"
import type { FolderListEntry } from "@/lib/bucket/folderPath"

function sortEntries(
  entries: FolderListEntry<FilePublic>[],
  files: FilePublic[],
  prefix: string,
  sort: FileSortKey
): FolderListEntry<FilePublic>[] {
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
    if (sort === "size") {
      const as = a.kind === "folder" ? folderTotals(files, prefix, a.name).bytes : a.file.size
      const bs = b.kind === "folder" ? folderTotals(files, prefix, b.name).bytes : b.file.size
      return as === bs ? 0 : as > bs ? 1 : -1
    }
    if (sort === "type") {
      const at = a.kind === "folder" ? "folder" : a.file.contentType
      const bt = b.kind === "folder" ? "folder" : b.file.contentType
      return at.localeCompare(bt)
    }
    const an = a.kind === "folder" ? a.name : (a.file.path.split("/").pop() ?? "")
    const bn = b.kind === "folder" ? b.name : (b.file.path.split("/").pop() ?? "")
    return an.localeCompare(bn)
  })
}

export function BucketFilesPanel({
  bucketId,
  canWrite,
  prefix,
  onPrefixChange,
  onDelete,
  onDeletePaths,
  onDeleteFolders,
  onCreateFolder,
}: {
  bucketId: string
  canWrite: boolean
  prefix: string
  onPrefixChange: (prefix: string) => void
  onDelete: (path: string) => Promise<string | null>
  onDeletePaths: (paths: string[]) => Promise<string | null>
  onDeleteFolders: (paths: string[]) => Promise<string | null>
  onCreateFolder: () => void
}) {
  const t = useTranslations("bucket")
  const [page, setPage] = useState(0)
  const [previewFile, setPreviewFile] = useState<FilePublic | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSort] = useState<FileSortKey>("name")
  const [refreshing, setRefreshing] = useState(false)
  const searching = debouncedQuery.length > 0

  const browse = useBucketFiles(searching ? null : bucketId, prefix, page)
  const search = useBucketSearch(searching ? bucketId : null, debouncedQuery, page)
  const active = searching ? search : browse
  const { files, total, totalPages, isLoading, refresh: refreshFiles } = active
  const apiFolders = searching ? [] : browse.folders
  const { refresh: refreshStats } = useBucketStats(bucketId)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(0)
  }, [prefix, debouncedQuery])

  useEffect(() => {
    setSelected(new Set())
  }, [prefix, page, debouncedQuery])

  const entries = useMemo(() => {
    if (searching) {
      return files.map((file) => ({ kind: "file" as const, file }))
    }
    return listFolderEntries(files, prefix, apiFolders)
  }, [apiFolders, files, prefix, searching])

  const visible = useMemo(
    () => sortEntries(entries, files, prefix, sort),
    [entries, files, prefix, sort]
  )
  const entryKeys = useMemo(() => visible.map(entryKey), [visible])
  const allSelected = entryKeys.length > 0 && entryKeys.every((k) => selected.has(k))

  const removeFileFromCache = async (path: string) => {
    await refreshFiles(
      (current: FileListPage | undefined) => {
        if (!current) return current
        const items = current.items.filter((f) => f.path !== path)
        const nextTotal = current.total > 0n ? current.total - 1n : 0n
        return { ...current, items, total: nextTotal }
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

  const toggleKey = (key: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const resolveSelectedPaths = () => {
    const paths: string[] = []
    const folderPaths: string[] = []
    for (const key of selected) {
      if (key.startsWith("file:")) {
        paths.push(key.slice(5))
        continue
      }
      const name = key.slice(7)
      paths.push(...pathsUnderFolder(files, prefix, name))
      folderPaths.push(joinObjectPath(prefix, `${name}/`))
    }
    return { paths: [...new Set(paths)], folderPaths: [...new Set(folderPaths)] }
  }

  const confirmBulkDelete = async () => {
    const { paths, folderPaths } = resolveSelectedPaths()
    setDeleting(true)
    const fileErr = paths.length > 0 ? await onDeletePaths(paths) : null
    const folderErr = !fileErr && folderPaths.length > 0 ? await onDeleteFolders(folderPaths) : null
    setDeleting(false)
    const err = fileErr ?? folderErr
    if (err) return
    setConfirmOpen(false)
    setSelected(new Set())
    await refreshFiles()
    void refreshStats()
  }

  const selectAll = useCallback(() => {
    setSelected(new Set(entryKeys))
  }, [entryKeys])

  const requestDelete = useCallback(() => {
    if (selected.size === 0) return
    setConfirmOpen(true)
  }, [selected.size])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refreshFiles(), refreshStats()])
    } finally {
      setRefreshing(false)
    }
  }

  useBucketExplorerHotkeys({
    enabled: true,
    canWrite,
    selectedCount: selected.size,
    confirmOpen,
    onSelectAll: selectAll,
    onRequestDelete: requestDelete,
    onCreateFolder,
    onConfirmDelete: () => {
      if (!deleting) void confirmBulkDelete()
    },
  })

  const empty = !isLoading && files.length === 0 && (searching || entries.length === 0)

  return (
    <div className="space-y-3">
      <BucketFilesToolbar
        query={query}
        sort={sort}
        refreshing={refreshing}
        canWrite={canWrite}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onRefresh={() => void handleRefresh()}
      />

      {canWrite ? (
        <BucketSelectBar
          count={selected.size}
          canWrite={canWrite}
          deleting={deleting}
          onClear={() => setSelected(new Set())}
          onDelete={() => setConfirmOpen(true)}
        />
      ) : null}

      {isLoading && files.length === 0 ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : empty ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {searching ? t("noFilterMatch") : t("noFiles")}
          </CardContent>
        </Card>
      ) : (
        <BucketFilesTable
          files={files}
          prefix={prefix}
          visible={visible}
          selected={selected}
          previewId={previewFile?.id}
          canWrite={canWrite}
          allSelected={allSelected}
          onToggleAll={(on) => setSelected(on ? new Set(entryKeys) : new Set())}
          onToggleKey={toggleKey}
          onOpenFolder={(name) => {
            onPrefixChange(nestedPrefix(prefix, name))
            setPreviewFile(null)
            setQuery("")
          }}
          onOpenFile={setPreviewFile}
        />
      )}

      <BucketFilePagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <Drawer
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
        swipeDirection="right"
      >
        <DrawerContent>
          {previewFile ? (
            <BucketFilePreviewPane
              bucketId={bucketId}
              file={previewFile}
              canWrite={canWrite}
              onDelete={handleDelete}
              onDeleted={() => setPreviewFile(null)}
            />
          ) : null}
        </DrawerContent>
      </Drawer>

      <BucketFileDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fileName=""
        count={selected.size}
        deleting={deleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  )
}
