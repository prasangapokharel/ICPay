"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { BucketDocsMobileNav } from "@/components/products/icbucket/bucket-docs-sidebar"
import type { BucketDocNavGroup } from "@/lib/bucket/docs/types"

export function BucketDocsChrome({
  navGroups,
  backHref = "/icbucket",
}: {
  navGroups: BucketDocNavGroup[]
  backHref?: string
}) {
  const t = useTranslations("bucket")

  return (
    <div className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <BucketBackButton href={backHref} />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              ICBucket
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("docsTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("docsSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/bucket" />} className="rounded-full">
              {t("createCta")}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/icbucket" />}
              className="rounded-full"
            >
              {t("pricingLink")}
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <BucketDocsMobileNav groups={navGroups} />
        </div>
      </div>
    </div>
  )
}
