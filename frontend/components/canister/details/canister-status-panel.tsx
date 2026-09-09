"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"
import type { CanisterRunStatus } from "@/lib/canister/format"

function statusVariant(
  status: CanisterRunStatus
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "running") return "default"
  if (status === "stopping") return "secondary"
  return "outline"
}

export function CanisterStatusPanel({
  state,
  compact,
  hideCyclesHero,
  className,
}: {
  state: CanisterStatusState
  compact?: boolean
  hideCyclesHero?: boolean
  className?: string
}) {
  const t = useTranslations("canisterStatus")

  if (state.kind === "idle") {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>{t("idle")}</p>
    )
  }

  if (state.kind === "loading") {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    )
  }

  if (state.kind === "denied") {
    return (
      <div className={cn("space-y-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-4", className)}>
        <p className="text-sm font-medium text-foreground">{t("deniedTitle")}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("deniedBody")}</p>
        <Link
          href="/canister/create"
          className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("createLink")}
        </Link>
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <div className={cn("space-y-1 rounded-xl border border-border/60 bg-muted/20 px-3 py-4", className)}>
        <p className="text-sm font-medium text-foreground">{t("errorTitle")}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  const { data } = state
  const rows: { label: string; value: string; mono?: boolean }[] = compact
    ? [
        { label: t("memory"), value: data.memoryLabel },
        { label: t("idleBurn"), value: data.idleBurnLabel },
        { label: t("controllers"), value: String(data.controllers.length) },
      ]
    : [
        { label: t("reserved"), value: data.reservedLabel },
        { label: t("memory"), value: data.memoryLabel },
        { label: t("wasmMemory"), value: data.wasmMemory },
        { label: t("stableMemory"), value: data.stableMemory },
        { label: t("idleBurn"), value: data.idleBurnLabel },
        { label: t("version"), value: data.version },
        { label: t("moduleHash"), value: data.moduleHash, mono: true },
        { label: t("freezing"), value: data.freezingThreshold },
        { label: t("compute"), value: data.computeAllocation },
        { label: t("memoryAlloc"), value: data.memoryAllocation },
        { label: t("snapshotsSize"), value: data.snapshotsSize },
      ]

  return (
    <div className={cn("space-y-3", className)}>
      {!hideCyclesHero && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(data.runStatus)}>
              {t(`run.${data.runStatus}`)}
            </Badge>
            {data.isController && <Badge variant="secondary">{t("youControl")}</Badge>}
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
            <p className="text-xs text-muted-foreground">{t("cycles")}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {data.cyclesLabel}
            </p>
          </div>
        </>
      )}
      {hideCyclesHero && (
        <p className="text-xs font-medium text-muted-foreground">{t("liveMetrics")}</p>
      )}
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
            <dd
              className={cn(
                "min-w-0 text-right text-xs font-medium text-foreground",
                row.mono && "break-all font-mono"
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {!compact && data.controllers.length > 0 && (
        <div className="space-y-1.5 border-t border-border/60 pt-3">
          <p className="text-xs font-medium text-muted-foreground">{t("controllers")}</p>
          <ul className="space-y-1">
            {data.controllers.map((c) => (
              <li key={c} className="break-all font-mono text-[11px] text-foreground">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
