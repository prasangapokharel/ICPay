"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function BucketBackButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("bucket")

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="-ml-2 h-auto px-2 py-1 text-muted-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      {t("back")}
    </Button>
  )
}
