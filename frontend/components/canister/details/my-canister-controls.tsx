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
  DropdownMenuSeparator,
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="size-7 rounded-lg border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
              aria-label="Canister actions"
            />
          }
        >
          {busy != null ? (
            <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
          ) : (
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-3.5" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            {/* Top up cycles - available to all */}
            <DropdownMenuItem
              onClick={() => setTopupOpen(true)}
              className="cursor-pointer gap-2"
            >
              <HugeiconsIcon icon={ArrowUp02Icon} className="size-4 text-primary" />
              <span>Top up cycles</span>
            </DropdownMenuItem>

            {/* Controller-only actions */}
            {canControl && (
              <>
                <DropdownMenuSeparator />

                {/* Start or Stop Canister */}
                {running ? (
                  <DropdownMenuItem
                    onClick={() => setStopOpen(true)}
                    disabled={busy != null}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    {busy === "stop" ? (
                      <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin text-destructive" />
                    ) : (
                      <HugeiconsIcon icon={StopIcon} className="size-4 text-destructive" />
                    )}
                    <span>{busy === "stop" ? t("stopping") : "Stop canister"}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => void run("start")}
                    disabled={busy != null || isStopping}
                    className="cursor-pointer gap-2 text-success focus:text-success focus:bg-success/10"
                  >
                    {busy === "start" ? (
                      <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin text-success" />
                    ) : (
                      <HugeiconsIcon icon={PlayIcon} className="size-4 text-success" />
                    )}
                    <span>{busy === "start" ? t("starting") : isStopping ? "Stopping..." : "Start canister"}</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Add Controller */}
                <DropdownMenuItem
                  onClick={() => setAddControllerOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <HugeiconsIcon icon={UserAdd01Icon} className="size-4 text-muted-foreground" />
                  <span>{t("addController")}</span>
                </DropdownMenuItem>

                {/* Transfer */}
                <DropdownMenuItem
                  onClick={() => setTransferOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <HugeiconsIcon icon={SentIcon} className="size-4 text-muted-foreground" />
                  <span>{t("transfer")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
