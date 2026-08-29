"use client"

import { useTranslations } from "next-intl"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import { BUCKET_SDK_INSTALL } from "@/lib/bucket/docsQuickstart"

export function BucketDocsInstallRow() {
  const t = useTranslations("bucket")

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t("docsQuickstartInstall")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            npm
          </p>
          <BucketCodeBlock code={BUCKET_SDK_INSTALL.npm} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            pip
          </p>
          <BucketCodeBlock code={BUCKET_SDK_INSTALL.pip} />
        </div>
      </div>
    </div>
  )
}
