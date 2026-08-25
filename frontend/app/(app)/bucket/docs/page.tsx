"use client"

import Link from "next/link"
import { useLayoutEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BucketBackButton } from "@/components/bucket/bucket-back-button"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import { BucketCodeTabs } from "@/components/bucket/bucket-code-tabs"
import { FILES_PAGE_SIZE, MAX_FILE_BYTES, formatBytes } from "@/lib/bucket/bucket"
import { apiDocSections } from "@/lib/bucket/docsApiSections"
import { BUCKET_API_METHODS } from "@/lib/bucket/docsMethodList"
import { cdnUrlExample, curlVerifyExample } from "@/lib/bucket/docsExamples"
import { WALLET_CANISTER_ID } from "@/services/icp"

export default function BucketDocsPage() {
  const t = useTranslations("bucket")

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [])

  return (
    <div className="w-full min-w-0 space-y-6 pt-2 pb-8">
      <BucketBackButton href="/bucket" />

      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("docsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("docsSubtitle")}</p>
      </div>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("docsStorageTitle")}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {t("docsStorageBody")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>· {t("docsImagesOnly")}</li>
            <li>· {t("docsWebpNote")}</li>
            <li>· {t("docsMaxFile", { size: formatBytes(MAX_FILE_BYTES) })}</li>
            <li>· {t("docsEncrypted")}</li>
            <li>· {t("docsPeriod")}</li>
          </ul>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/bucket/pricing" />}>
            {t("pricingLink")}
          </Button>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("docsCdnTitle")}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">{t("docsCdnBody")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <BucketCodeBlock code={cdnUrlExample()} />
          <CardDescription className="text-xs leading-relaxed">{t("docsCdnOption")}</CardDescription>
          <CardDescription className="text-xs leading-relaxed">{t("docsCdnPrivate")}</CardDescription>
          <p className="text-xs font-medium text-foreground">{t("docsCdnVerifyTitle")}</p>
          <BucketCodeBlock code={curlVerifyExample()} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("docsApiTitle")}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">{t("docsApiBody")}</CardDescription>
          <CardDescription className="font-mono text-xs">
            {t("docsApiCanister", { id: WALLET_CANISTER_ID })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">{t("docsMethodListTitle")}</p>
            <Card size="sm" className="py-0">
              <CardContent className="overflow-x-auto px-0">
                <Table className="min-w-[28rem] text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>{t("docsMethodColName")}</TableHead>
                      <TableHead>{t("docsMethodColKind")}</TableHead>
                      <TableHead>{t("docsMethodColAuth")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono">
                    {BUCKET_API_METHODS.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell className="text-foreground/90">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.kind}</TableCell>
                        <TableCell className="font-sans text-muted-foreground">{row.auth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card size="sm" className="border-dashed">
            <CardHeader className="gap-1">
              <CardTitle className="text-xs">{t("docsAuthTitle")}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{t("docsAuthBody")}</CardDescription>
            </CardHeader>
          </Card>

          {apiDocSections().map((section) => (
            <div key={section.id} className="space-y-2">
              <p className="text-xs font-medium text-foreground">{t(section.titleKey)}</p>
              {section.bodyKey ? (
                <p className="text-xs leading-relaxed text-muted-foreground">{t(section.bodyKey)}</p>
              ) : null}
              <BucketCodeTabs examples={section.examples()} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{t("docsPaginationTitle")}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {t("docsPaginationBody", { size: String(FILES_PAGE_SIZE) })}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
