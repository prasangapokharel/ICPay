"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import { BucketCodeTabs } from "@/components/bucket/bucket-code-tabs"
import { FILES_PAGE_SIZE, MAX_FILE_BYTES, formatBytes } from "@/lib/bucket/bucket"
import {
  apiKeyExamples,
  cdnUrlExample,
  curlVerifyExample,
  downloadExamples,
  uploadExamples,
} from "@/lib/bucket/docs-examples"
import { WALLET_CANISTER_ID } from "@/services/icp"

export default function BucketDocsPage() {
  const t = useTranslations("bucket")

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-2 pb-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-auto px-2 py-1 text-muted-foreground"
        nativeButton={false}
        render={<Link href="/bucket" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        {t("back")}
      </Button>

      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("docsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("docsSubtitle")}</p>
      </div>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsStorageTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsStorageBody")}</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>· {t("docsImagesOnly")}</li>
          <li>· {t("docsWebpNote")}</li>
          <li>· {t("docsMaxFile", { size: formatBytes(MAX_FILE_BYTES) })}</li>
          <li>· {t("docsEncrypted")}</li>
          <li>· {t("docsPeriod")}</li>
        </ul>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          nativeButton={false}
          render={<Link href="/bucket/pricing" />}
        >
          {t("pricingLink")}
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsCdnTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsCdnBody")}</p>
        <BucketCodeBlock code={cdnUrlExample()} />
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsCdnPrivate")}</p>
        <p className="text-xs font-medium text-foreground">{t("docsCdnVerifyTitle")}</p>
        <BucketCodeBlock code={curlVerifyExample()} />
      </section>

      <section className="space-y-4 rounded-2xl border p-4">
        <div>
          <h2 className="text-sm font-semibold">{t("docsApiTitle")}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("docsApiBody")}</p>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            {t("docsApiCanister", { id: WALLET_CANISTER_ID })}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">{t("docsTsUploadTitle")}</p>
          <BucketCodeTabs examples={uploadExamples()} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">{t("docsTsGetTitle")}</p>
          <BucketCodeTabs examples={downloadExamples()} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsApiKeysTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsApiKeysBody")}</p>
        <BucketCodeTabs examples={apiKeyExamples()} />
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsPaginationTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("docsPaginationBody", { size: String(FILES_PAGE_SIZE) })}
        </p>
      </section>
    </div>
  )
}
