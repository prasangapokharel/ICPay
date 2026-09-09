"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  FuelStationIcon,
  MoreVerticalIcon,
  PlayIcon,
  SentIcon,
  Settings02Icon,
  StopIcon,
  UserAdd01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MyCanisterTopupDialog } from "@/components/canister/details/my-canister-topup-dialog"
import { MyCanisterTransferDialog } from "@/components/canister/details/my-canister-transfer-dialog"
import { MyCanisterAddControllerDialog } from "@/components/canister/details/my-canister-add-controller-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import {
  formatManageError,
  startCanister,
  stopCanister,
} from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"

export function MyCanisterControls({
  canisterId,
  status,
  onRefresh,
  onCopyId,
  onTabChange,
}: {
  canisterId: string
  status: CanisterStatusState
  onRefresh: () => void
  onCopyId: () => void
  onTabChange?: (tab: string) => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [stopOpen, setStopOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [addControllerOpen, setAddControllerOpen] = useState(false)

  const canControl = status.kind === "ok" && status.data.isController
  const running = status.kind === "ok" && status.data.runStatus === "running"
  const isStopping = status.kind === "ok" && status.data.runStatus === "stopping"
  const id = encodeURIComponent(canisterId)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = () => {
    onCopyId()
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  const run = async (action: "start" | "stop") => {
    if (!identity) return
    setBusy(action)
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
      setBusy(null)
      setStopOpen(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/40 bg-card/40 p-2 sm:p-2.5">
        {/* Left: Start / Stop Button */}
        {running ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-2 text-xs font-medium text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors"
            disabled={!canControl || busy != null}
            onClick={() => setStopOpen(true)}
          >
            {busy === "stop" ? (
              <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
            ) : (
              <HugeiconsIcon icon={StopIcon} className="size-3.5" />
            )}
            <span>{busy === "stop" ? t("stopping") : "Stop canister"}</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-2 text-xs font-medium text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-colors"
            disabled={!canControl || busy != null || isStopping}
            onClick={() => void run("start")}
          >
            {busy === "start" ? (
              <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
            ) : (
              <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
            )}
            <span>{busy === "start" ? t("starting") : isStopping ? "Stopping..." : "Start canister"}</span>
          </Button>
        )}

        {/* Center: Top-up Cycles Button */}
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2 rounded-xl bg-pink-600 px-5 text-xs font-medium text-white shadow-sm hover:bg-pink-500 sm:text-sm cursor-pointer transition-all"
          disabled={busy != null}
          onClick={() => setTopupOpen(true)}
        >
          <HugeiconsIcon icon={ArrowUp02Icon} className="size-4" />
          <span>Top up cycles</span>
        </Button>

        {/* Right: Transfer & More */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-2 text-xs font-normal text-muted-foreground hover:text-foreground cursor-pointer"
            disabled={!canControl || busy != null}
            onClick={() => setTransferOpen(true)}
          >
            <HugeiconsIcon icon={SentIcon} className="size-3.5" />
            <span>{t("transfer")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                />
              }
            >
              <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                  <HugeiconsIcon
                    icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                    className="mr-2 size-4"
                  />
                  {copied ? t("copied") : t("copyId")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTopupOpen(true)} className="cursor-pointer">
                  <HugeiconsIcon icon={FuelStationIcon} className="mr-2 size-4 text-pink-500" />
                  {t("topUp")}
                </DropdownMenuItem>
                {canControl && (
                  <DropdownMenuItem onClick={() => setAddControllerOpen(true)} className="cursor-pointer">
                    <HugeiconsIcon icon={UserAdd01Icon} className="mr-2 size-4 text-primary" />
                    {t("addController")}
                  </DropdownMenuItem>
                )}
                {onTabChange ? (
                  <DropdownMenuItem onClick={() => onTabChange("settings")} className="cursor-pointer">
                    <HugeiconsIcon icon={Settings02Icon} className="mr-2 size-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem render={<Link href={`/canister/${id}/settings`} className="cursor-pointer" />}>
                    <HugeiconsIcon icon={Settings02Icon} className="mr-2 size-4" />
                    {t("settings")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("topUpCancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy === "stop"}
              onClick={() => void run("stop")}
            >
              {busy === "stop" ? t("stopping") : t("stop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MyCanisterTopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        canisterId={canisterId}
        onDone={onRefresh}
      />
      <MyCanisterTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        fromCanisterId={canisterId}
        onDone={onRefresh}
      />
      <MyCanisterAddControllerDialog
        open={addControllerOpen}
        onOpenChange={setAddControllerOpen}
        canisterId={canisterId}
        onDone={onRefresh}
      />
    </>
  )
}
