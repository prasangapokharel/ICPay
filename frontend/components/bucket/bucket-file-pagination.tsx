"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function BucketFilePagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  const t = useTranslations("bucket")

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <p className="text-[10px] text-muted-foreground">
        {t("pageOf", { page: String(page + 1), total: String(totalPages), count: String(total) })}
      </p>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          {t("prevPage")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          {t("nextPage")}
        </Button>
      </div>
    </div>
  )
}
