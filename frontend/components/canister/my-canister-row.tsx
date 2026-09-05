"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { cn } from "@/lib/ui/utils"

export function MyCanisterRow({
  id,
  label,
  place,
  countries,
  selected,
  status,
  statusLoading,
  onSelect,
}: {
  id: string
  label: string
  place: string
  countries?: string[]
  selected: boolean
  status?: MineRowStatus
  statusLoading?: boolean
  onSelect: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")
  const [copied, setCopied] = useState(false)

  const onCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    void navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect()
          }
        }}
        className={cn(
          "group flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted",
          selected && "bg-muted"
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{label}</span>
            {statusLoading && !status ? (
              <Skeleton className="h-5 w-16 rounded-full" />
            ) : status?.kind === "ok" ? (
              <>
                <Badge
                  variant={
                    status.data.runStatus === "running"
                      ? "default"
                      : status.data.runStatus === "stopped"
                        ? "outline"
                        : "secondary"
                  }
                  className="h-5 gap-1 px-1.5 text-[10px]"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status.data.runStatus === "running"
                        ? "bg-emerald-400"
                        : "bg-muted-foreground"
                    )}
                  />
                  {ts(`run.${status.data.runStatus}`)}
                </Badge>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {status.data.cyclesLabel}
                </span>
              </>
            ) : status?.kind === "denied" ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {t("rowDenied")}
              </Badge>
            ) : null}
          </div>
          <p className="w-full truncate font-mono text-[10px] text-muted-foreground">{id}</p>
          {(countries && countries.length > 0) || place ? (
            <div className="flex min-w-0 items-center gap-1.5">
              {countries && countries.length > 0 ? (
                <SubnetCountryFlags countries={countries} max={4} />
              ) : null}
              {place ? (
                <span className="truncate text-[11px] text-muted-foreground">{place}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={t("copyId")}
          onClick={onCopy}
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
        </Button>
      </div>
    </li>
  )
}
