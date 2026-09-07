"use client"

import useSWR from "swr"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MyCanisterControls } from "@/components/canister/my-canister-controls"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"
import type { ControlledCanister } from "@/services/canister/controlledCanisters"
import { fetchSubnetIndexDetail } from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"
import type { CanisterRunStatus } from "@/lib/canister/format"

function statusBadgeVariant(status: CanisterRunStatus): "running" | "stopped" | "stopping" {
  if (status === "running") return "running"
  if (status === "stopping") return "stopping"
  return "stopped"
}

function shortHash(hash: string): string {
  const h = hash.trim()
  if (h.length <= 16) return h
  return `${h.slice(0, 8)}…${h.slice(-8)}`
}

export function MyCanisterDetailsV2({
  canisterId,
  localName,
  meta,
  status,
  onRefresh,
}: {
  canisterId: string
  localName: string
  meta: ControlledCanister | null
  status: CanisterStatusState
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")

  const { data: subnet } = useSWR(
    meta?.subnetId ? (["subnet-index", meta.subnetId] as const) : null,
    ([, id]) => fetchSubnetIndexDetail(id),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )

  const handleCopy = () => {
    void navigator.clipboard.writeText(canisterId)
    toast.success("Copied to clipboard")
  }

  const displayName = localName || meta?.name || ""
  const moduleHash =
    status.kind === "ok" && status.data.moduleHash !== "—"
      ? status.data.moduleHash
      : meta?.moduleHash
        ? shortHash(meta.moduleHash)
        : ""

  return (
    <div className="space-y-6">
      {/* Header: Full ID with copy button */}
      <div className="flex items-start justify-between gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="min-w-0 flex-1 cursor-help break-all font-mono text-sm text-muted-foreground" />
            }
          >
            {canisterId}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{canisterId}</p>
          </TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy canister ID"
          onClick={handleCopy}
        >
          <HugeiconsIcon icon={Copy01Icon} className="size-4" />
        </Button>
      </div>

      {/* Cycles Hero Card */}
      {status.kind === "ok" ? (
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{ts("cycles")}</CardDescription>
            <CardTitle className="text-4xl font-semibold tabular-nums tracking-tight">
              {status.data.cyclesLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusBadgeVariant(status.data.runStatus)}>
                {ts(`run.${status.data.runStatus}`)}
              </Badge>
              {status.data.isController && (
                <Badge variant="secondary">{ts("youControl")}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("cyclesSource")}
            </p>
          </CardContent>
        </Card>
      ) : status.kind === "loading" ? (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-20" />
          </CardContent>
        </Card>
      ) : status.kind === "denied" ? (
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} />
          <AlertTitle>Cycles balance is private</AlertTitle>
          <AlertDescription>
            Only controllers of this canister can view its cycles balance.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Action Bar */}
      <MyCanisterControls
        canisterId={canisterId}
        status={status}
        onRefresh={onRefresh}
        onCopyId={handleCopy}
      />

      {/* Metadata Card */}
      {(meta || displayName) && (
        <Card>
          <CardContent className="pt-6">
            <Table className="border-none">
              <TableBody>
                {displayName && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaName")}</TableCell>
                    <TableCell className="text-right">{displayName}</TableCell>
                  </TableRow>
                )}
                {meta?.canisterType && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaType")}</TableCell>
                    <TableCell className="text-right">{meta.canisterType}</TableCell>
                  </TableRow>
                )}
                {meta?.language && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaLanguage")}</TableCell>
                    <TableCell className="text-right">{meta.language}</TableCell>
                  </TableRow>
                )}
                {meta?.updatedAt && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaUpdated")}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {new Date(meta.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )}
                {moduleHash && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{ts("moduleHash")}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{moduleHash}</TableCell>
                  </TableRow>
                )}
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{t("metaControllers")}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {status.kind === "ok"
                      ? status.data.controllers.length
                      : meta?.controllers.length ?? "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Subnet Card */}
      {meta?.subnetId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("metaSubnet")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meta.countries.length > 0 && (
              <SubnetCountryFlags countries={meta.countries} max={8} />
            )}
            <Table className="border-none">
              <TableBody>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{t("metaSubnetId")}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {shortSubnetId(meta.subnetId)}
                  </TableCell>
                </TableRow>
                {subnet?.subnetType && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaSubnetType")}</TableCell>
                    <TableCell className="text-right">{subnet.subnetType}</TableCell>
                  </TableRow>
                )}
                {(subnet?.upNodes || meta.nodeCount) > 0 && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaSubnetNodes")}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {subnet
                        ? `${subnet.upNodes}/${subnet.totalNodes || subnet.upNodes}`
                        : String(meta.nodeCount)}
                    </TableCell>
                  </TableRow>
                )}
                {subnet && subnet.runningCanisters > 0 && (
                  <TableRow className="border-none">
                    <TableCell className="text-muted-foreground">{t("metaSubnetCanisters")}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {subnet.runningCanisters} running · {subnet.stoppedCanisters} stopped
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Live Metrics Card */}
      {status.kind === "ok" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ts("liveMetrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="border-none">
              <TableBody>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("reserved")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.reservedLabel}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("memory")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.memoryLabel}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("wasmMemory")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.wasmMemory}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("stableMemory")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.stableMemory}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("idleBurn")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.idleBurnLabel}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("version")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.version}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("freezing")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.freezingThreshold}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("compute")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.computeAllocation}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("memoryAlloc")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.memoryAllocation}</TableCell>
                </TableRow>
                <TableRow className="border-none">
                  <TableCell className="text-muted-foreground">{ts("snapshotsSize")}</TableCell>
                  <TableCell className="text-right tabular-nums">{status.data.snapshotsSize}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Upgrades Card */}
      {meta && meta.upgrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("metaUpgrades")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-3">
              {meta.upgrades.slice(0, 5).map((u, i) => (
                <li key={`${u.proposalId}-${i}`} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tabular-nums">#{u.proposalId}</span>
                    <span className="text-xs text-muted-foreground">{u.atLabel}</span>
                  </div>
                  {u.moduleHash && (
                    <p className="truncate font-mono text-xs text-muted-foreground/60">
                      {shortHash(u.moduleHash)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-full"
              nativeButton={false}
              render={
                <a
                  href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {t("dashboard")}
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{t("backupHint")}</p>
    </div>
  )
}
