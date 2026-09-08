"use client"

import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BucketFileDeleteDialog({
  open,
  onOpenChange,
  fileName,
  count,
  deleting,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  count?: number
  deleting: boolean
  onConfirm: () => void | Promise<void>
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const bulk = (count ?? 1) > 1

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {bulk ? t("deleteSelectedTitle") : t("deleteFileTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {bulk
              ? t("deleteSelectedBody", { count: String(count) })
              : t("deleteFileBody", { name: fileName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={(e) => {
              e.preventDefault()
              void onConfirm()
            }}
          >
            {deleting ? tc("loading") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
