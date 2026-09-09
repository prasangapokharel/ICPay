"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp02Icon,
  MoreVerticalIcon,
  PlayIcon,
  SentIcon,
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
}: {
  canisterId: string
  status: CanisterStatusState
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [stopOpen, setStopOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [addControllerOpen, setAddControllerOpen] = useState(false)

  const canControl = status.kind === "ok" && status.data.isController
  const running = status.kind === "ok" && status.data.runStatus === "running"
  const isStopping = status.kind === "ok" && status.data.runStatus === "stopping"

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
        {/* Left: Start / Stop Button + More Menu */}
        <div className="flex items-center gap-1">
          {running ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 gap-2 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
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
              className="h-9 gap-2 text-xs font-medium text-success hover:text-success hover:bg-success/10 cursor-pointer transition-colors"
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

          {canControl && (
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
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setAddControllerOpen(true)} className="cursor-pointer">
                    <HugeiconsIcon icon={UserAdd01Icon} className="mr-2 size-4 text-primary" />
                    {t("addController")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Center: Top-up Cycles Button */}
        <Button
          type="button"
          size="sm"
          className="h-9 gap-2 rounded-xl bg-primary px-5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 sm:text-sm cursor-pointer transition-all"
          disabled={busy != null}
          onClick={() => setTopupOpen(true)}
        >
          <HugeiconsIcon icon={ArrowUp02Icon} className="size-4" />
          <span>Top up cycles</span>
        </Button>

        {/* Right: Transfer */}
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
