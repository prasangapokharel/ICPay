"use client"

import Link from "next/link"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CanisterStatusPanel } from "@/components/canister/canister-status-panel"
import { MyCanisterActions } from "@/components/canister/my-canister-actions"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"
import type { ControlledCanister } from "@/services/canister/controlledCanisters"
import { fetchSubnetIndexDetail } from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"
import { cn } from "@/lib/ui/utils"

function shortHash(hash: string): string {
  const h = hash.trim()
  if (h.length <= 16) return h
  return `${h.slice(0, 8)}…${h.slice(-8)}`
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-right text-xs font-medium text-foreground",
          mono && "break-all font-mono"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function MyCanisterDetails({
  canisterId,
  localName,
  meta,
  status,
  onCopyId,
  onCopyPrincipal,
  onRemove,
}: {
  canisterId: string
  localName: string
  meta: ControlledCanister | null
  status: CanisterStatusState
  onCopyId: () => void
  onCopyPrincipal: () => void
  onRemove: () => void
}) {
  const t = useTranslations("myCanisters")
  const ts = useTranslations("canisterStatus")

  const { data: subnet } = useSWR(
    meta?.subnetId ? (["subnet-index", meta.subnetId] as const) : null,
    ([, id]) => fetchSubnetIndexDetail(id),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )

  const cyclesHero =
    status.kind === "ok" ? (
      <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-4">
        <p className="text-xs font-medium text-muted-foreground">{ts("cycles")}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-foreground">
          {status.data.cyclesLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            variant={
              status.data.runStatus === "running"
                ? "default"
                : status.data.runStatus === "stopped"
                  ? "outline"
                  : "secondary"
            }
          >
            {ts(`run.${status.data.runStatus}`)}
          </Badge>
          {status.data.isController ? (
            <Badge variant="secondary">{ts("youControl")}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{t("cyclesSource")}</p>
      </div>
    ) : status.kind === "loading" ? (
      <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/25 px-4 py-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-40" />
      </div>
    ) : null

  const displayName = localName || meta?.name || ""
  const moduleHash =
    status.kind === "ok" && status.data.moduleHash !== "—"
      ? status.data.moduleHash
      : meta?.moduleHash
        ? shortHash(meta.moduleHash)
        : ""

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-1">
        <p className="min-w-0 flex-1 break-all font-mono text-[11px] text-muted-foreground">
          {canisterId}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("copyId")}
          onClick={onCopyId}
        >
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
        </Button>
      </div>

      {cyclesHero}

      {(meta || displayName) && (
        <dl className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
          {displayName ? <MetaRow label={t("metaName")} value={displayName} /> : null}
          {meta?.canisterType ? (
            <MetaRow label={t("metaType")} value={meta.canisterType} />
          ) : null}
          {meta?.language ? (
            <MetaRow label={t("metaLanguage")} value={meta.language} />
          ) : null}
          {meta?.updatedAt ? (
            <MetaRow
              label={t("metaUpdated")}
              value={new Date(meta.updatedAt).toLocaleString()}
            />
          ) : null}
          {moduleHash ? (
            <MetaRow label={ts("moduleHash")} value={moduleHash} mono />
          ) : null}
          <MetaRow
            label={t("metaControllers")}
            value={
              status.kind === "ok"
                ? String(status.data.controllers.length)
                : String(meta?.controllers.length || "—")
            }
          />
        </dl>
      )}

      {meta?.subnetId ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
          <p className="text-xs font-medium text-muted-foreground">{t("metaSubnet")}</p>
          {meta.countries.length > 0 ? (
            <SubnetCountryFlags countries={meta.countries} max={8} />
          ) : null}
          <dl className="space-y-2">
            <MetaRow label={t("metaSubnetId")} value={shortSubnetId(meta.subnetId)} mono />
            {subnet?.subnetType ? (
              <MetaRow label={t("metaSubnetType")} value={subnet.subnetType} />
            ) : null}
            {(subnet?.upNodes || meta.nodeCount) > 0 ? (
              <MetaRow
                label={t("metaSubnetNodes")}
                value={
                  subnet
                    ? `${subnet.upNodes}/${subnet.totalNodes || subnet.upNodes}`
                    : String(meta.nodeCount)
                }
              />
            ) : null}
            {subnet && subnet.runningCanisters > 0 ? (
              <MetaRow
                label={t("metaSubnetCanisters")}
                value={`${subnet.runningCanisters} running · ${subnet.stoppedCanisters} stopped`}
              />
            ) : null}
          </dl>
        </div>
      ) : null}

      <CanisterStatusPanel state={status} hideCyclesHero={status.kind === "ok"} />

      {meta && meta.upgrades.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
          <p className="text-xs font-medium text-muted-foreground">{t("metaUpgrades")}</p>
          <ul className="space-y-2">
            {meta.upgrades.slice(0, 5).map((u, i) => (
              <li key={`${u.proposalId}-${i}`} className="space-y-0.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium tabular-nums">#{u.proposalId}</span>
                  <span className="text-muted-foreground">{u.atLabel}</span>
                </div>
                {u.moduleHash ? (
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {shortHash(u.moduleHash)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-0 text-xs"
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
        </div>
      ) : null}

      <MyCanisterActions
        canisterId={canisterId}
        onCopyId={onCopyId}
        onCopyPrincipal={onCopyPrincipal}
        onRemove={onRemove}
      />
      <p className="text-xs text-muted-foreground">{t("backupHint")}</p>
      <p className="text-[11px] text-muted-foreground">
        {t("publicApiHint")}{" "}
        <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
          {t("topUp")}
        </Link>
      </p>
    </div>
  )
}
