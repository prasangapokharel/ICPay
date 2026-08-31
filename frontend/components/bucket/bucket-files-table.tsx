"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BucketFileIcon, BucketFolderIcon } from "@/components/bucket/bucket-file-icon"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { folderTotals, type FolderListEntry } from "@/lib/bucket/folderPath"
import type { FilePublic } from "@/services/bucket/types"

export function entryKey(entry: FolderListEntry<FilePublic>): string {
  return entry.kind === "folder" ? `folder:${entry.name}` : `file:${entry.file.path}`
}

export function BucketFilesTable({
  files,
  prefix,
  visible,
  selected,
  previewId,
  canWrite,
  allSelected,
  onToggleAll,
  onToggleKey,
  onOpenFolder,
  onOpenFile,
}: {
  files: FilePublic[]
  prefix: string
  visible: FolderListEntry<FilePublic>[]
  selected: Set<string>
  previewId?: string
  canWrite: boolean
  allSelected: boolean
  onToggleAll: (on: boolean) => void
  onToggleKey: (key: string, on: boolean) => void
  onOpenFolder: (name: string) => void
  onOpenFile: (file: FilePublic) => void
}) {
  const t = useTranslations("bucket")

  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            {canWrite ? (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => onToggleAll(v === true)}
                  aria-label={t("selectedCount", { count: String(visible.length) })}
                />
              </TableHead>
            ) : null}
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("fileSize")}</TableHead>
            <TableHead>{t("mimeType")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((entry) => {
            const key = entryKey(entry)
            return entry.kind === "folder" ? (
              <TableRow
                key={key}
                className="cursor-pointer"
                data-state={selected.has(key) ? "selected" : undefined}
                onClick={() => onOpenFolder(entry.name)}
              >
                {canWrite ? (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(key)}
                      onCheckedChange={(v) => onToggleKey(key, v === true)}
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <BucketFolderIcon />
                    <span className="truncate text-sm font-medium">{entry.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatFileSize(folderTotals(files, prefix, entry.name).bytes)}
                </TableCell>
                <TableCell className="text-muted-foreground">{t("folder")}</TableCell>
                <TableCell className="text-right">
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow
                key={key}
                className="cursor-pointer"
                data-state={
                  selected.has(key) || previewId === entry.file.id ? "selected" : undefined
                }
                onClick={() => onOpenFile(entry.file)}
              >
                {canWrite ? (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(key)}
                      onCheckedChange={(v) => onToggleKey(key, v === true)}
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <BucketFileIcon path={entry.file.path} />
                    <span className="truncate text-sm font-medium" title={entry.file.path}>
                      {entry.file.path.split("/").pop()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatFileSize(entry.file.size)}
                </TableCell>
                <TableCell className="max-w-40 truncate text-muted-foreground">
                  {entry.file.contentType}
                </TableCell>
                <TableCell className="text-right">
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
