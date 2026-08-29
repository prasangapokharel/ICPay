"use client"

import Link from "next/link"
import { useLayoutEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  BucketDocsMobileNav,
  BucketDocsSidebar,
} from "@/components/products/icbucket/bucket-docs-sidebar"
import { FILES_PAGE_SIZE, MAX_FILE_BYTES, formatBytes } from "@/lib/bucket/bucket"
import { apiDocSections } from "@/lib/bucket/docsApiSections"
import { BUCKET_API_METHODS } from "@/lib/bucket/docsMethodList"
import { cdnUrlExample, curlVerifyExample } from "@/lib/bucket/docsExamples"
import { WALLET_CANISTER_ID } from "@/services/icp"
import { cn } from "@/lib/ui/utils"

function DocSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("scroll-mt-28 space-y-5", className)}>
      <div className="space-y-2 border-b border-border/60 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function DocSubsection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-28 space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
      ) : null}
      {children}
    </div>
  )
}

export function BucketDocsView({ backHref = "/icbucket" }: { backHref?: string }) {
  const t = useTranslations("bucket")

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [])

  return (
    <div className="min-h-screen bg-background">
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
            <BucketDocsMobileNav />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <BucketDocsSidebar />
          </div>
        </aside>

        <main className="min-w-0 space-y-16">
          <DocSection id="overview" title={t("docsStorageTitle")} description={t("docsStorageBody")}>
            <Card>
              <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
                <ul className="space-y-2 text-sm text-muted-foreground md:text-base">
                  <li>· {t("docsImagesOnly")}</li>
                  <li>· {t("docsWebpNote")}</li>
                  <li>· {t("docsMaxFile", { size: formatBytes(MAX_FILE_BYTES) })}</li>
                </ul>
                <ul className="space-y-2 text-sm text-muted-foreground md:text-base">
                  <li>· {t("docsEncrypted")}</li>
                  <li>· {t("docsPeriod")}</li>
                </ul>
              </CardContent>
            </Card>
          </DocSection>

          <DocSection id="cdn" title={t("docsCdnTitle")} description={t("docsCdnBody")}>
            <DocSubsection id="cdn-url" title={t("docsCdnTitle")}>
              <BucketCodeBlock code={cdnUrlExample()} />
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("docsCdnOption")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("docsCdnPrivate")}
              </p>
            </DocSubsection>
            <DocSubsection id="cdn-verify" title={t("docsCdnVerifyTitle")}>
              <BucketCodeBlock code={curlVerifyExample()} />
            </DocSubsection>
          </DocSection>

          <DocSection
            id="api"
            title={t("docsApiTitle")}
            description={t("docsApiBody")}
            className="space-y-10"
          >
            <p className="font-mono text-xs text-muted-foreground md:text-sm">
              {t("docsApiCanister", { id: WALLET_CANISTER_ID })}
            </p>

            <DocSubsection id="api-methods" title={t("docsMethodListTitle")}>
              <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>{t("docsMethodColName")}</TableHead>
                      <TableHead>{t("docsMethodColKind")}</TableHead>
                      <TableHead>{t("docsMethodColAuth")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono text-sm">
                    {BUCKET_API_METHODS.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell className="text-foreground/90">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.kind}</TableCell>
                        <TableCell className="font-sans text-muted-foreground">{row.auth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DocSubsection>

            <DocSubsection id="api-auth" title={t("docsAuthTitle")} description={t("docsAuthBody")} />

            {apiDocSections().map((section) => (
              <DocSubsection
                key={section.id}
                id={section.id}
                title={t(section.titleKey)}
                description={section.bodyKey ? t(section.bodyKey) : undefined}
              >
                <BucketCodeTabs examples={section.examples()} />
              </DocSubsection>
            ))}
          </DocSection>

          <DocSection
            id="pagination"
            title={t("docsPaginationTitle")}
            description={t("docsPaginationBody", { size: String(FILES_PAGE_SIZE) })}
          />
        </main>
      </div>
    </div>
  )
}
