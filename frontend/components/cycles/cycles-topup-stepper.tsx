"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/ui/utils"
import type { TopUpFlowStep } from "@/services/cycles/topUp"

const FLOW_STEPS: TopUpFlowStep[] = ["send", "mint", "done"]
const STEP_KEYS = ["stepSend", "stepMint", "stepDone"] as const

type StepState = "complete" | "active" | "upcoming" | "failed"

function resolveState(
  index: number,
  flowStep: TopUpFlowStep | null,
  failed?: boolean
): StepState {
  if (flowStep == null) return index === 0 ? "active" : "upcoming"
  const idx = FLOW_STEPS.indexOf(flowStep)
  if (failed && index === idx) return "failed"
  if (flowStep === "done") return "complete"
  if (index < idx) return "complete"
  if (index === idx) return "active"
  return "upcoming"
}

export function CyclesTopUpStepper({
  flowStep,
  failed,
}: {
  flowStep: TopUpFlowStep | null
  failed?: boolean
}) {
  const t = useTranslations("cyclesTopUp")

  return (
    <ol className="flex w-full items-start">
      {STEP_KEYS.map((key, i) => {
        const state = resolveState(i, flowStep, failed)
        const isLast = i === STEP_KEYS.length - 1
        const lineAfterComplete =
          flowStep === "done" ||
          (flowStep != null && FLOW_STEPS.indexOf(flowStep) > i)

        return (
          <li key={key} className="flex min-w-0 flex-1 items-start">
            <div className="flex w-full min-w-0 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 min-w-0 flex-1 rounded-full",
                    i === 0
                      ? "bg-transparent"
                      : flowStep === "done" ||
                          (flowStep != null && FLOW_STEPS.indexOf(flowStep) >= i)
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
                    state === "complete" && "border-primary bg-primary",
                    state === "active" && "border-primary",
                    state === "upcoming" && "border-muted-foreground/30",
                    state === "failed" && "border-destructive bg-destructive/10"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 rounded-full",
                      state === "complete" && "bg-primary-foreground",
                      state === "active" && "bg-primary",
                      state === "upcoming" && "bg-muted-foreground/35",
                      state === "failed" && "bg-destructive"
                    )}
                  />
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 min-w-0 flex-1 rounded-full",
                    isLast ? "bg-transparent" : lineAfterComplete ? "bg-primary" : "bg-border"
                  )}
                />
              </div>

              <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("stepLabel", { n: i + 1 })}
              </p>
              <p
                className={cn(
                  "mt-0.5 max-w-full truncate px-0.5 text-xs font-semibold leading-tight sm:text-sm",
                  state === "failed" && "text-destructive",
                  state === "upcoming" && "text-muted-foreground",
                  (state === "active" || state === "complete") && "text-foreground"
                )}
              >
                {t(key)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
