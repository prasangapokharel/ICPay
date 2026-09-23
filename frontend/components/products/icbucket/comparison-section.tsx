"use client"

import { useTranslations } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

const FEATURE_MATRIX = [
  { id: "0", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "1", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "2", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "3", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "4", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "5", icbucket: true, s3: false, gcs: false, azure: false },
  { id: "6", icbucket: true, s3: true, gcs: false, azure: false },
  { id: "7", icbucket: true, s3: true, gcs: true, azure: true },
  { id: "8", icbucket: true, s3: true, gcs: true, azure: true },
  { id: "9", icbucket: true, s3: true, gcs: true, azure: true },
] as const

function CheckIcon() {
  return <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-primary" strokeWidth={1.75} />
}

function XIcon() {
  return <HugeiconsIcon icon={Cancel01Icon} className="size-5 text-muted-foreground/60" strokeWidth={1.75} />
}

export function ComparisonSection() {
  const t = useTranslations("publicSite.icbucket.comparison")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 space-y-3 text-center md:mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("subtitle")}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
                <TableHead className="w-[280px] text-left px-5 py-4 font-bold text-foreground">{t("featureColumn")}</TableHead>
                <TableHead className="text-center font-bold text-foreground">{t("icbucketColumn")}</TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">{t("s3Column")}</TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">{t("gcsColumn")}</TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">{t("azureColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_MATRIX.map((feature) => (
                <TableRow key={feature.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/20">
                  <TableCell className="text-left px-5 py-3.5 font-medium text-foreground">
                    {t(`features.${feature.id}`)}
                  </TableCell>
                  <TableCell className="text-center py-3.5 bg-primary/5">
                    <div className="flex justify-center">
                      {feature.icbucket ? <CheckIcon /> : <XIcon />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    <div className="flex justify-center">
                      {feature.s3 ? <CheckIcon /> : <XIcon />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    <div className="flex justify-center">
                      {feature.gcs ? <CheckIcon /> : <XIcon />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    <div className="flex justify-center">
                      {feature.azure ? <CheckIcon /> : <XIcon />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
