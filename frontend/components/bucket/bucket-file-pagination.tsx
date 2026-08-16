"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

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
      <p className="text-xs text-muted-foreground">
        {t("pageOf", { page: String(page + 1), total: String(totalPages), count: String(total) })}
      </p>
      <ButtonGroup>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          {t("prevPage")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          {t("nextPage")}
        </Button>
      </ButtonGroup>
    </div>
  )
}
