"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  InformationCircleIcon,
  Link01Icon,
  PlayIcon,
  StopIcon,
  Settings02Icon,
  Camera01Icon,
  DashboardSquare01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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

import { MyCanisterControls } from "@/components/canister/details/my-canister-controls"
import { SubnetCountryFlags } from "@/components/canister/subnet-country-flags"
import { CanisterOverviewGuide } from "@/components/canister/details/canister-overview-guide"
import { CanisterSnapshotsGuide } from "@/components/canister/details/canister-snapshots-guide"
import { SnapshotsCard } from "@/components/canister/details/snapshots-card"
import { CanisterSettingsView } from "@/components/canister/settings"

import { useAuth } from "@/components/auth/auth-provider"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"
import type { ControlledCanister } from "@/services/canister/controlledCanisters"
import { fetchSubnetIndexDetail } from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"
import { shortCanisterId, rememberCanister } from "@/lib/canister/savedCanisters"
import {
  formatManageError,
  startCanister,
  stopCanister,
} from "@/services/canister/management"
import { cn } from "@/lib/ui/utils"

function shortHash(hash: string): string {
  const h = hash.trim()
  if (h.length <= 16) return h
  return `${h.slice(0, 8)}…${h.slice(-8)}`
}

export type CanisterDetailTab = "overview" | "settings" | "snapshots"

export function MyCanisterDetails({
  canisterId,
  localName,
  meta,
  status,
  onCopyId,
  onRefresh,
  defaultTab = "overview",
  onTabChange,
}: {
  canisterId: string
  localName: string
  meta: ControlledCanister | null
  status: CanisterStatusState
  onCopyId: () => void
  onRefresh: () => void
  defaultTab?: CanisterDetailTab
  onTabChange?: (tab: CanisterDetailTab) => void
}) {
  const t = useTranslations("myCanisters")
  const router = useRouter()
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null

  const [activeTab, setActiveTab] = useState<string>(defaultTab)
  const [copied, setCopied] = useState(false)
  const [technicalOpen, setTechnicalOpen] = useState(false)
  const [busyAction, setBusyAction] = useState<"start" | "stop" | null>(null)
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false)

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
    onTabChange?.(tab as CanisterDetailTab)
  }

  const { data: subnet } = useSWR(
    meta?.subnetId ? (["subnet-index", meta.subnetId] as const) : null,
    ([, id]) => fetchSubnetIndexDetail(id),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )

  const displayName = localName || meta?.name || shortCanisterId(canisterId)
  const isController = status.kind === "ok" && status.data.isController
  const runStatus = status.kind === "ok" ? status.data.runStatus : null

  const cyclesParts = useMemo(() => {
    if (status.kind !== "ok") return { number: "—", unit: "" }
    const match = status.data.cyclesLabel.match(/^([\d.]+)\s*(.*)$/)
    if (match) {
      return { number: match[1], unit: match[2] }
    }
    return { number: status.data.cyclesLabel, unit: "" }
  }, [status])

  const handleCopy = () => {
    onCopyId()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    toast.success(t("copied"))
  }

  const runHeaderAction = async (action: "start" | "stop") => {
    if (!identity) return
    setBusyAction(action)
    try {
      if (action === "start") {
        await startCanister(identity, canisterId)
        toast.success("Canister started successfully")
      } else {
        await stopCanister(identity, canisterId)
        toast.success("Canister stopped successfully")
      }
      rememberCanister(identity.getPrincipal().toText(), canisterId)
      onRefresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusyAction(null)
      setStopConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Back navigation */}
      <button
        type="button"
        onClick={() => router.push("/canister")}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3.5" />
        <span>Canisters</span>
      </button>

      {/* 2. Header Row: Title, ID pill, Status Badges & Quick Start/Stop */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {displayName}
          </h1>

          {/* Canister ID pill with copy button */}
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground">
            <span>{canisterId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              aria-label={t("copyId")}
            >
              <HugeiconsIcon
                icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                className="size-3.5"
              />
            </button>
          </div>
        </div>

        {/* Right side: Status badges & Quick Start/Stop button */}
        <div className="flex flex-wrap items-center gap-2">
          {status.kind === "ok" ? (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  runStatus === "running"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : runStatus === "stopped"
                      ? "border-border bg-muted text-muted-foreground"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    runStatus === "running" ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                  )}
                />
                {runStatus === "running"
                  ? "Running"
                  : runStatus === "stopped"
                    ? "Stopped"
                    : "Stopping"}
              </span>

              {isController ? (
                <span className="inline-flex items-center rounded-full border border-border/40 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  You control
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  Read only
                </span>
              )}

              {/* Quick Start / Stop Toggle Button on the Right */}
              {isController && (
                <>
                  {runStatus === "running" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-full border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer"
                      disabled={busyAction != null}
                      onClick={() => setStopConfirmOpen(true)}
                    >
                      {busyAction === "stop" ? (
                        <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={StopIcon} className="size-3.5" />
                      )}
                      <span>{busyAction === "stop" ? "Stopping..." : "Stop canister"}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 cursor-pointer"
                      disabled={busyAction != null || runStatus === "stopping"}
                      onClick={() => void runHeaderAction("start")}
                    >
                      {busyAction === "start" ? (
                        <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
                      )}
                      <span>
                        {busyAction === "start"
                          ? "Starting..."
                          : runStatus === "stopping"
                            ? "Stopping..."
                            : "Start canister"}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </>
          ) : status.kind === "loading" ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. Action Toolbar (Top up, Transfer, Controls) */}
      <MyCanisterControls
        canisterId={canisterId}
        status={status}
        onRefresh={onRefresh}
        onCopyId={onCopyId}
        onTabChange={(tab) => handleTabSelect(tab)}
      />

      {/* 4. Tab Navigation: Overview | Settings | Snapshots */}
      <Tabs value={activeTab} onValueChange={handleTabSelect} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3 p-1">
          <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={Settings02Icon} className="size-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="snapshots" className="gap-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={Camera01Icon} className="size-4" />
            <span>Snapshots</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          {/* Overview Architecture Guide Card */}
          <CanisterOverviewGuide />

          {/* Cycles Balance Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span>Cycles balance</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 space-y-2 text-xs">
                  <p className="font-semibold text-foreground">Canister Cycles Balance</p>
                  <p className="text-muted-foreground">
                    Cycles represent computation and memory fuel on the Internet Computer. 1 Trillion cycles (1 T) is pegged to 1 XDR (~$1.35 USD). Canisters consume cycles continuously for message execution and storage.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>

            {status.kind === "ok" ? (
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                  {cyclesParts.number}
                </span>
                {cyclesParts.unit && (
                  <span className="text-2xl font-medium text-muted-foreground">
                    {cyclesParts.unit}
                  </span>
                )}
              </div>
            ) : status.kind === "loading" ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
            ) : (
              <p className="text-2xl font-semibold text-muted-foreground">—</p>
            )}

            <div className="border-t border-border/40 pt-3">
              <p className="text-xs text-muted-foreground/80">
                Live from <span className="font-mono text-muted-foreground">canister_status</span> · visible because you&apos;re a controller
              </p>
            </div>
          </div>

          {/* Live Metrics 4-Column Grid Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/40 gap-y-4 md:gap-y-0 shadow-xs">
            {/* Memory */}
            <div className="md:px-4 first:pl-0 space-y-1">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>Memory</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 space-y-1.5 text-xs">
                  <p className="font-semibold text-foreground">Total Memory Size</p>
                  <p className="text-muted-foreground">
                    Aggregate memory footprint consumed by this canister across 32-bit WASM heap, 64-bit stable memory, snapshots, and runtime state.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                {status.kind === "ok" ? status.data.memoryLabel : "—"}
              </p>
            </div>

            {/* Wasm memory */}
            <div className="md:px-4 space-y-1 pt-3 md:pt-0">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>Wasm memory</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 space-y-1.5 text-xs">
                  <p className="font-semibold text-foreground">Wasm Heap Memory</p>
                  <p className="text-muted-foreground">
                    32-bit WebAssembly linear heap occupied by the canister runtime code and heap allocations. Protocol limit is 4 GiB.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                {status.kind === "ok" ? status.data.wasmMemory : "—"}
              </p>
            </div>

            {/* Stable memory */}
            <div className="md:px-4 space-y-1 pt-3 md:pt-0">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>Stable memory</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 space-y-1.5 text-xs">
                  <p className="font-semibold text-foreground">Persistent Stable Memory</p>
                  <p className="text-muted-foreground">
                    64-bit persistent storage on the Internet Computer. Survives canister code upgrades and can scale up to 400 GiB.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                {status.kind === "ok" ? status.data.stableMemory : "—"}
              </p>
            </div>

            {/* Reserved cycles */}
            <div className="md:px-4 last:pr-0 space-y-1 pt-3 md:pt-0">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>Reserved cycles</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72 space-y-1.5 text-xs">
                  <p className="font-semibold text-foreground">Reserved Cycles</p>
                  <p className="text-muted-foreground">
                    Cycles held in reserve by the subnet to allocate storage space and resource limits for this canister.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                {status.kind === "ok" ? status.data.reservedLabel : "—"}
              </p>
            </div>
          </div>

          {/* Subnet Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <HoverCard>
                <HoverCardTrigger className="cursor-help inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  <span>Subnet</span>
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-muted-foreground/70" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 space-y-2 text-xs">
                  <p className="font-semibold text-foreground">Internet Computer Subnet</p>
                  <p className="text-muted-foreground">
                    Subnets are autonomous blockchains formed by independent data centers across multiple nations executing canisters in parallel.
                  </p>
                </HoverCardContent>
              </HoverCard>

              {meta?.subnetId && (
                <HoverCard>
                  <HoverCardTrigger className="cursor-pointer">
                    <span className="rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      {shortSubnetId(meta.subnetId)}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Subnet Identifier</p>
                    <p className="break-all font-mono text-[11px] text-muted-foreground">{meta.subnetId}</p>
                    <a
                      href={`https://dashboard.internetcomputer.org/subnet/${meta.subnetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-1"
                    >
                      <span>View subnet on explorer</span>
                      <HugeiconsIcon icon={Link01Icon} className="size-3" />
                    </a>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {meta?.canisterType || subnet?.subnetType || "application"} subnet ·{" "}
              {subnet ? `${subnet.upNodes} / ${subnet.totalNodes || subnet.upNodes} nodes up` : `${meta?.nodeCount || 13} nodes up`}
              {subnet && subnet.runningCanisters > 0
                ? ` · ${subnet.runningCanisters.toLocaleString()} canisters running, ${subnet.stoppedCanisters.toLocaleString()} stopped`
                : ""}
            </p>

            {meta && meta.countries && meta.countries.length > 0 && (
              <div className="pt-1">
                <SubnetCountryFlags countries={meta.countries} max={8} />
              </div>
            )}
          </div>

          {/* Technical Details Collapsible Card */}
          <Collapsible
            open={technicalOpen}
            onOpenChange={setTechnicalOpen}
            className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden shadow-xs"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/10 transition-colors cursor-pointer">
              <span className="text-sm font-semibold text-foreground">Technical details</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-4 text-muted-foreground transition-transform duration-200", !technicalOpen && "-rotate-90")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-border/40 p-5 space-y-4">
              <dl className="space-y-3 text-xs">
                {status.kind === "ok" && (
                  <>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Canister Version</dt>
                      <dd className="font-mono font-medium text-foreground">v{status.data.version}</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Module Hash</dt>
                      <dd className="font-mono text-muted-foreground">
                        {status.data.moduleHash !== "—" ? shortHash(status.data.moduleHash) : "—"}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Freezing Threshold</dt>
                      <dd className="font-medium text-foreground">{status.data.freezingThreshold}</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Compute Allocation</dt>
                      <dd className="font-medium text-foreground">{status.data.computeAllocation}</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Memory Allocation</dt>
                      <dd className="font-medium text-foreground">{status.data.memoryAllocation}</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Snapshots Size</dt>
                      <dd className="font-medium text-foreground">{status.data.snapshotsSize}</dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Idle Burn Rate</dt>
                      <dd className="font-medium text-foreground">{status.data.idleBurnLabel}</dd>
                    </div>
                  </>
                )}

                {/* Controllers row */}
                {status.kind === "ok" && (
                  <div className="border-t border-border/40 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Controllers ({status.data.controllers.length})</dt>
                      <button
                        type="button"
                        onClick={() => handleTabSelect("settings")}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        <HugeiconsIcon icon={Settings02Icon} className="size-3" />
                        <span>Manage in Settings</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {status.data.controllers.map((ctrl) => {
                        const isYou = principal === ctrl
                        return (
                          <div
                            key={ctrl}
                            className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-2.5 py-1.5 font-mono text-[11px]"
                          >
                            <span className="truncate text-muted-foreground">{ctrl}</span>
                            {isYou && (
                              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] shrink-0">
                                You
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </dl>

              {/* IC Explorer Link */}
              <div className="border-t border-border/40 pt-3 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Explorer data</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs gap-1.5 cursor-pointer"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
                  <span>{t("dashboard")}</span>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* TAB 2: SETTINGS */}
        <TabsContent value="settings" className="space-y-4">
          {status.kind === "ok" ? (
            <CanisterSettingsView
              key={`${canisterId}-${status.data.version}`}
              canisterId={canisterId}
              data={status.data}
              isController={isController}
              onRefresh={onRefresh}
            />
          ) : status.kind === "loading" ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
              Canister status unavailable
            </div>
          )}
        </TabsContent>

        {/* TAB 3: SNAPSHOTS */}
        <TabsContent value="snapshots" className="space-y-4">
          <CanisterSnapshotsGuide />
          <SnapshotsCard canisterId={canisterId} embedded />
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal for Stopping Canister */}
      <AlertDialog open={stopConfirmOpen} onOpenChange={setStopConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("topUpCancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyAction === "stop"}
              onClick={() => void runHeaderAction("stop")}
            >
              {busyAction === "stop" ? t("stopping") : t("stop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
