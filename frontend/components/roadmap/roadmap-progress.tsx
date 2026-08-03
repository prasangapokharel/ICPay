"use client"

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { PHASES, STATUS_META, phaseProgress, overallProgress } from "./roadmap-data"

const config = { pct: { label: "Complete", color: "var(--primary)" } } satisfies ChartConfig

const data = PHASES.map((p) => ({
  phase: `P${p.index}`,
  title: p.title,
  status: p.status,
  pct: phaseProgress(p),
}))

export function RoadmapProgress() {
  const overall = overallProgress()
  const shipped = PHASES.filter((p) => p.status === "shipped").length
  const doneCount = PHASES.flatMap((p) => p.milestones).filter((m) => m.done).length
  const totalCount = PHASES.flatMap((p) => p.milestones).length

  return (
    <section className="rounded-2xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Progress</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {doneCount} of {totalCount} milestones across {PHASES.length} phases
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold tabular-nums leading-none">{overall}%</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">overall</p>
        </div>
      </div>

      <ChartContainer config={config} className="mt-4 h-40 w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="phase"
            tickLine={false}
            axisLine={false}
            width={26}
            tick={{ fontSize: 10 }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelKey="title" formatter={(v) => `${v}% complete`} />}
          />
          <Bar dataKey="pct" radius={4} barSize={12}>
            {data.map((d) => (
              // Planned phases sit at 0% and would render as nothing. A muted
              // fill keeps the row visible so the scale reads honestly.
              <Cell
                key={d.phase}
                fill={d.status === "planned" ? "var(--muted-foreground)" : "var(--primary)"}
                fillOpacity={d.status === "planned" ? 0.25 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <HoverCard>
          <HoverCardTrigger
            render={<button type="button" />}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-primary" />
            {shipped} phases live
          </HoverCardTrigger>
          <HoverCardContent className="w-72 text-xs leading-relaxed">
            A phase counts as shipped only when it runs on mainnet, not when the code merges.
            Percentages come from the milestone list on this page — they are a checklist, not an
            estimate of remaining effort.
          </HoverCardContent>
        </HoverCard>

        <span className="text-muted-foreground/40">·</span>

        {(["shipped", "active", "next", "planned"] as const).map((s) => (
          <Badge key={s} variant={STATUS_META[s].badge}>
            {STATUS_META[s].label}
          </Badge>
        ))}
      </div>
    </section>
  )
}
