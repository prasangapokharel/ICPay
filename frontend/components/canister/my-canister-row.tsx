"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { FuelIcon, PlayIcon, StopIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import { useAuth } from "@/components/auth/auth-provider"
import type { MineRowStatus } from "@/hooks/canister/useMineStatusMap"
import { formatManageError, startCanister, stopCanister } from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"
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
  onChanged,
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
  onChanged: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [stopOpen, setStopOpen] = useState(false)

  const canControl = status?.kind === "ok" && status.data.isController
  const running = status?.kind === "ok" && status.data.runStatus === "running"
  const stopped = status?.kind === "ok" && status.data.runStatus === "stopped"

  const run = async (action: "start" | "stop") => {
    if (!identity) return
    setBusy(action)
    try {
      if (action === "start") await startCanister(identity, id)
      else await stopCanister(identity, id)
      rememberCanister(identity.getPrincipal().toText(), id)
      onChanged()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(null)
      setStopOpen(false)
    }
  }

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
            <RowIconAction
              icon={FuelIcon}
              label={t("topUp")}
              onClick={onTopUp}
            />
            <RowIconAction
              icon={PlayIcon}
              label={busy === "start" ? t("starting") : t("start")}
              disabled={!canControl || running || busy != null}
              onClick={() => void run("start")}
            />
            <RowIconAction
              icon={StopIcon}
              label={t("stop")}
              disabled={!canControl || stopped || busy != null}
              onClick={() => setStopOpen(true)}
            />
          </ButtonGroup>
        </TableCell>
      </TableRow>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("topUpCancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={busy === "stop"} onClick={() => void run("stop")}>
              {busy === "stop" ? t("stopping") : t("stop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
