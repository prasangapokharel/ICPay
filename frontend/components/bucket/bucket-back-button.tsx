"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function BucketBackButton({
  onClick,
  href,
}: {
  onClick?: () => void
  href?: string
}) {
  const t = useTranslations("bucket")

  const label = (
    <>
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      {t("back")}
    </>
  )

  if (href) {
    return (
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={href} />}>
        {label}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      {label}
    </Button>
  )
}
