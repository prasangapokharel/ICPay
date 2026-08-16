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
  deleting,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  deleting: boolean
  onConfirm: () => void | Promise<void>
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteFileTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteFileBody", { name: fileName })}
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
