"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  TerminalIcon,
  LinkSquare02Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const PROBLEM_IDS = ["0", "1", "2", "3"] as const
const SOLUTION_ICONS = [
  Layers01Icon,
  TerminalIcon,
  LinkSquare02Icon,
  Package01Icon,
] as const

export function ProblemSolution() {
  const t = useTranslations("publicSite.icfalcon.problemSolution")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="mb-8 text-xl font-semibold">{t("problemHeading")}</h3>
              <div className="space-y-6">
                {PROBLEM_IDS.map((id) => (
                  <Card key={id} size="sm">
                    <CardHeader>
                      <CardTitle>{t(`problems.${id}.title`)}</CardTitle>
                      <CardDescription>{t(`problems.${id}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-8 text-xl font-semibold">{t("solutionHeading")}</h3>
              <div className="space-y-6">
                {PROBLEM_IDS.map((id, index) => (
                  <Card key={id} size="sm">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-2">
                        <HugeiconsIcon
                          icon={SOLUTION_ICONS[index]}
                          className="mt-0.5 size-5 shrink-0 text-primary"
                        />
                        <span>{t(`solutions.${id}.title`)}</span>
                      </CardTitle>
                      <CardDescription>{t(`solutions.${id}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
