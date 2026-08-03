"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  ArrowDown01Icon,
  InformationCircleIcon,
  Alert02Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { PHASES, STATUS_META, phaseProgress, type Phase } from "./roadmap-data"

function MilestoneRow({ label, done, note }: { label: string; done: boolean; note?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
        )}
      >
        {done && <HugeiconsIcon icon={Tick02Icon} className="size-2.5" />}
      </span>
      <span className={cn("text-xs leading-relaxed", !done && "text-muted-foreground")}>
        {label}
        {note && (
          <Popover>
            {/* Popover rather than a tooltip: these notes are a sentence or
                three, and a touch device has no hover to reveal them with. */}
            <PopoverTrigger
              aria-label={`Why: ${label}`}
              className="ml-1 inline-flex translate-y-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent side="top" className="w-72 text-xs leading-relaxed">
              {note}
            </PopoverContent>
          </Popover>
        )}
      </span>
    </li>
  )
}

function PhaseCard({ phase, isLast }: { phase: Phase; isLast: boolean }) {
  // Only the phase actually in flight starts open. Opening everything turns a
  // stepper into a wall of text.
  const [open, setOpen] = useState(phase.status === "active" || phase.status === "next")
  const meta = STATUS_META[phase.status]
  const pct = phaseProgress(phase)

  return (
    <li className="relative flex gap-3.5">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
            phase.status === "shipped" && "border-primary bg-primary text-primary-foreground",
            phase.status === "active" && "border-primary text-primary",
            phase.status === "next" && "border-muted-foreground/40 text-foreground",
            phase.status === "planned" && "border-dashed border-muted-foreground/30 text-muted-foreground"
          )}
        >
          <HugeiconsIcon icon={phase.icon} className="size-4" />
        </span>
        {!isLast && (
          <span
            aria-hidden
            className={cn(
              "w-0.5 flex-1 rounded-full",
              phase.status === "shipped" ? "bg-primary/40" : "bg-border"
            )}
          />
        )}
      </div>

      <Collapsible open={open} onOpenChange={setOpen} className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
        <CollapsibleTrigger className="group/trigger w-full text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Phase {phase.index}
              </p>
              <h3 className="mt-0.5 text-sm font-semibold leading-tight">{phase.title}</h3>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant={meta.badge}>{meta.label}</Badge>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="size-4 text-muted-foreground transition-transform group-data-open/trigger:rotate-180"
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{phase.summary}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <Progress value={pct} className="flex-1 [&_[data-slot=progress-track]]:h-1" />
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-closed:animate-accordion-up data-open:animate-accordion-down">
          <div className="mt-3.5 space-y-3.5 rounded-xl border bg-muted/30 p-3.5">
            {phase.dependsOn && (
              <div className="flex flex-wrap items-center gap-1.5">
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Needs
                </span>
                {phase.dependsOn.map((d) => (
                  <Badge key={d} variant="outline">
                    {d}
                  </Badge>
                ))}
              </div>
            )}

            <ul className="space-y-2">
              {phase.milestones.map((m) => (
                <MilestoneRow key={m.label} {...m} />
              ))}
            </ul>

            {phase.risks && (
              <div className="space-y-1.5 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                  <HugeiconsIcon icon={Alert02Icon} className="size-3" />
                  Known risks
                </p>
                {phase.risks.map((r) => (
                  <p key={r} className="text-xs leading-relaxed text-muted-foreground">
                    {r}
                  </p>
                ))}
              </div>
            )}

            {phase.doneWhen && (
              <p className="border-t pt-2.5 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Done when: </span>
                {phase.doneWhen}
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

export function RoadmapStepper() {
  return (
    <ol className="mt-2">
      {PHASES.map((phase, i) => (
        <PhaseCard key={phase.id} phase={phase} isLast={i === PHASES.length - 1} />
      ))}
    </ol>
  )
}
