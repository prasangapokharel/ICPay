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

export function ComparisonSection() {
  const t = useTranslations("publicSite.icbucket.comparison")

  const CheckIcon = () => (
    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-primary" />
  )
  const XIcon = () => (
    <HugeiconsIcon icon={Cancel01Icon} className="size-5 text-muted-foreground" />
  )

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px] text-center font-bold">{t("featureColumn")}</TableHead>
                  <TableHead className="text-center font-bold">{t("icbucketColumn")}</TableHead>
                  <TableHead className="text-center font-bold">{t("s3Column")}</TableHead>
                  <TableHead className="text-center font-bold">{t("gcsColumn")}</TableHead>
                  <TableHead className="text-center font-bold">{t("azureColumn")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURE_MATRIX.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell className="text-center font-medium">
                      {t(`features.${feature.id}`)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.icbucket ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.s3 ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.gcs ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
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
      </div>
    </section>
  )
}
