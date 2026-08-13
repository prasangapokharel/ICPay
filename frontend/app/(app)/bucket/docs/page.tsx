"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { FILES_PAGE_SIZE, MAX_FILE_BYTES, formatBytes } from "@/lib/bucket/bucket"
import { BUCKET_CDN_ORIGIN, getBucketCdnBase } from "@/lib/bucket/cdn"
import { WALLET_CANISTER_ID } from "@/services/icp"

const RAW_CDN_EXAMPLE =
  `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/{bucketName}/{filename}.webp`

export default function BucketDocsPage() {
  const t = useTranslations("bucket")
  const cdnBase = getBucketCdnBase()
  const cdnExample = cdnBase
    ? `${BUCKET_CDN_ORIGIN}/{bucketName}/{filename}.webp`
    : RAW_CDN_EXAMPLE
  const curlHost = cdnBase ?? `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud`

  return (
    <div className="space-y-6 pt-2 pb-8">
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

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsStorageTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsStorageBody")}</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>· {t("docsImagesOnly")}</li>
          <li>· {t("docsWebpNote")}</li>
          <li>· {t("docsMaxFile", { size: formatBytes(MAX_FILE_BYTES) })}</li>
          <li>· {t("docsEncrypted")}</li>
          <li>· {t("docsPeriod")}</li>
        </ul>
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsTiersTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsTiersBody")}</p>
        <Button variant="outline" size="sm" className="h-8 text-xs" nativeButton={false} render={<Link href="/bucket/pricing" />}>
          {t("pricingLink")}
        </Button>
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsCdnTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsCdnBody")}</p>
        <p className="truncate rounded-lg bg-muted/40 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
          {cdnExample}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsCdnPrivate")}</p>
        <p className="text-xs font-medium text-foreground">{t("docsCdnVerifyTitle")}</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`# After upload — expect 200 and content-type: image/webp
curl -sS -I "${curlHost}/{bucketName}/logo.webp"`}</pre>
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsApiTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsApiBody")}</p>
        <p className="text-xs font-medium text-foreground">{t("docsTsUploadTitle")}</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`import { prepareUploadFile } from "@/lib/bucket/prepare-upload"
import { storeFile } from "@/lib/bucket/store-file"

const prepared = await prepareUploadFile(file)

// Chunked automatically — IC ingress is 2 MiB per call; max 10 MB per file
const result = await storeFile(identity, prepared.file, {
  bucketId,
  path: prepared.path,
  contentType: prepared.contentType,
  onProgress: (pct) => console.log(\`\${pct}%\`),
})

if ("err" in result) throw new Error(result.err)`}</pre>
        <p className="text-xs font-medium text-foreground">{t("docsTsGetTitle")}</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`// Public CDN (no auth) — bucket name in the URL
const url = ${cdnBase ? `\`${BUCKET_CDN_ORIGIN}/\${bucketName}\${path}\`` : `\`https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/\${bucketName}\${path}\``}
const res = await fetch(url) // e.g. /logo.webp at bucket root

// Authenticated canister query (public + private)
const bytes = await downloadFileBlob(identity, bucketId, path)`}</pre>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("docsApiCanister", { id: WALLET_CANISTER_ID })}
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">{t("docsApiKeysTitle")}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("docsApiKeysBody")}</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">{`import { createApiKey, revokeApiKey, deleteFile } from "@/services/bucket/bucket"

const created = await createApiKey(identity, bucketId, "CI", {
  read: true, write: true, delete: false,
})
// Use bucketId for API calls; public CDN URLs use the bucket name
await deleteFile(undefined, bucketId, "/old.webp", created.ok.secret)`}</pre>
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
