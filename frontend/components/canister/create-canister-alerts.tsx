"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, LinkSquare02Icon, Tick02Icon, ZapIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { canisterDashboardUrl } from "@/services/canister/createCanister"

export type CreateCanisterSuccess = {
  canister: string
  block: string
  amount: string
  withdrew: boolean
}

export function CreateCanisterAlerts({
  error,
  lastOk,
  onDismissSuccess,
}: {
  error: string | null
  lastOk: CreateCanisterSuccess | null
  onDismissSuccess: () => void
}) {
  const t = useTranslations("canisterCreate")
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const copyCanister = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      toast.success(tc("copied"))
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("failed")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog
        open={lastOk != null}
        onOpenChange={(open) => {
          if (!open) {
            setCopied(false)
            onDismissSuccess()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="animate-in fade-in zoom-in-75 mb-1 flex size-16 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
              <span className="flex size-11 items-center justify-center rounded-full bg-success text-background shadow-sm">
                <HugeiconsIcon icon={Tick02Icon} className="size-7" strokeWidth={3} />
              </span>
            </div>
            <DialogTitle>{t("successTitle")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("success", { canister: lastOk?.canister ?? "" })}
            </DialogDescription>
          </DialogHeader>

          {lastOk && (
            <div className="space-y-4 text-center">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-1">
                  <p className="max-w-[85%] break-all font-mono text-sm text-foreground/80">
                    {lastOk.canister}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label={tc("copy")}
                    onClick={() => void copyCanister(lastOk.canister)}
                  >
                    <HugeiconsIcon
                      icon={copied ? Tick02Icon : Copy01Icon}
                      className="size-3.5"
                    />
                  </Button>
                </div>
                <p className="text-sm text-foreground">
                  {t("amountPaid")}:{" "}
                  <span className="font-medium tabular-nums">{lastOk.amount} ICP</span>
                  {" · "}
                  {t("blockIndex")}:{" "}
                  <span className="font-medium tabular-nums">{lastOk.block}</span>
                </p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {lastOk.withdrew && <p>{t("successWithdrew")}</p>}
                <p>{t("successHint")}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-stretch">
            {lastOk && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex-1 gap-1.5"
                  nativeButton={false}
                  render={
                    <a
                      href={canisterDashboardUrl(lastOk.canister)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                  {t("viewOnDashboard")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full flex-1 gap-1.5"
                  nativeButton={false}
                  render={<Link href="/topup" />}
                >
                  <HugeiconsIcon icon={ZapIcon} className="size-3.5" />
                  {t("topUpNext")}
                </Button>
              </>
            )}
            <Button type="button" variant="default" className="w-full flex-1" onClick={onDismissSuccess}>
              {tc("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
