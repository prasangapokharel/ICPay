"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { FuelIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { cn } from "@/lib/ui/utils"

function RowIconAction({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
          >
            <HugeiconsIcon icon={icon} className="size-4" strokeWidth={1.75} />
          </Button>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function MyCanisterRow({
  id,
  label,
  place,
  countries,
  selected,
  status,
  statusLoading,
  onSelect,
  onTopUp,
}: {
  id: string
  label: string
  place: string
  countries?: string[]
  selected: boolean
  status?: MineRowStatus
  statusLoading?: boolean
  onSelect: () => void
  onTopUp: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")

  return (
    <>
      <TableRow
        data-state={selected ? "selected" : undefined}
        className="cursor-pointer"
        onClick={onSelect}
      >
        <TableCell>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">{label}</span>
              {statusLoading && !status ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : status?.kind === "ok" ? (
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
        </TableCell>
        <TableCell className="text-right">
          <span className="text-xs tabular-nums text-muted-foreground">
            {status?.kind === "ok" ? status.data.cyclesLabel : "—"}
          </span>
        </TableCell>
        <TableCell className="w-0" onClick={(e) => e.stopPropagation()}>
          <ButtonGroup>
            <RowIconAction icon={ViewIcon} label={t("view")} onClick={onSelect} />
            <RowIconAction icon={FuelIcon} label={t("topUp")} onClick={onTopUp} />
          </ButtonGroup>
        </TableCell>
      </TableRow>
    </>
  )
}
