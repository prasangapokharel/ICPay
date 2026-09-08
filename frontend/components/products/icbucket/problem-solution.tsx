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
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  CloudIcon,
  MoneyBag02Icon,
  DatabaseIcon,
  ShieldIcon,
} from "@hugeicons/core-free-icons"

const ROW_IDS = ["0", "1", "2", "3"] as const

const ROW_ICONS = [
  {
    problem: MoneyBag02Icon,
    solution: MoneyBag02Icon,
  },
  {
    problem: DatabaseIcon,
    solution: ShieldIcon,
  },
  {
    problem: AlertCircleIcon,
    solution: CheckmarkCircle02Icon,
  },
  {
    problem: CloudIcon,
    solution: CloudIcon,
  },
] as const

function TopicCell({
  icon,
  title,
  description,
  tone,
}: {
  icon: typeof MoneyBag02Icon
  title: string
  description: string
  tone: "problem" | "solution"
}) {
  const iconClass = tone === "problem" ? "text-destructive" : "text-primary"

  return (
    <div className="flex gap-3 py-1">
      <HugeiconsIcon icon={icon} className={`mt-0.5 size-5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-snug">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ProblemSolution() {
  const t = useTranslations("publicSite.icbucket.problemSolution")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 space-y-3 text-center md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-1/2 px-4 py-4 text-base font-semibold">
                    {t("problemColumn")}
                  </TableHead>
                  <TableHead className="w-1/2 border-l px-4 py-4 text-base font-semibold">
                    {t("solutionColumn")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROW_IDS.map((id, index) => (
                  <TableRow key={id} className="align-top">
                    <TableCell className="whitespace-normal px-4 py-5">
                      <TopicCell
                        icon={ROW_ICONS[index].problem}
                        title={t(`rows.${id}.problemTitle`)}
                        description={t(`rows.${id}.problemDescription`)}
                        tone="problem"
                      />
                    </TableCell>
                    <TableCell className="whitespace-normal border-l px-4 py-5">
                      <TopicCell
                        icon={ROW_ICONS[index].solution}
                        title={t(`rows.${id}.solutionTitle`)}
                        description={t(`rows.${id}.solutionDescription`)}
                        tone="solution"
                      />
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
