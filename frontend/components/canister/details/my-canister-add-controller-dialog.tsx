"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { addController, Principal } from "@/services/canister/management"
import { formatManageError } from "@/services/canister/management"

export function MyCanisterAddControllerDialog({
  open,
  onOpenChange,
  canisterId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  onDone?: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const [principalText, setPrincipalText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ principal: string } | null>(null)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrincipalText("")
    setSuccess(null)
  }, [open])

  const principalError = useMemo(() => {
    const text = principalText.trim()
    if (!text) return null
    try {
      const p = Principal.fromText(text)
      if (p.isAnonymous()) return t("invalidPrincipal")
      return null
    } catch {
      return t("invalidPrincipal")
    }
  }, [principalText, t])

  const onConfirm = async () => {
    if (!identity || !principalText.trim() || principalError) return
    setSubmitting(true)
    try {
      await addController(identity, canisterId, principalText.trim())
      setSuccess({ principal: principalText.trim() })
      onDone?.()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open && success == null}
        onOpenChange={(next) => {
          if (!submitting) onOpenChange(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={UserAdd01Icon} className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{t("addControllerTitle")}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {t("addControllerHint")}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Guide Callout */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-primary" />
                <span>Controller Permissions on Internet Computer</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Controllers hold full administrative authority over this canister. They can install WASM code, start or stop execution, modify resource limits, and add or remove other controllers.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("transferFromContext")}:{" "}
              <span className="break-all font-mono text-foreground/80">{canisterId}</span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="add-controller-principal">{t("addControllerLabel")}</Label>
              <Input
                id="add-controller-principal"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                placeholder={t("addControllerPlaceholder")}
                spellCheck={false}
                autoComplete="off"
                disabled={submitting}
                aria-invalid={Boolean(principalError)}
                className="font-mono text-sm"
              />
              {principalError ? (
                <p className="text-xs font-medium text-destructive">{principalError}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">{t("addControllerFullListHint")}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button variant="outline" disabled={submitting}>
                  {t("topUpCancel")}
                </Button>
              }
            />
            <Button
              type="button"
              disabled={
                !isAuthenticated ||
                submitting ||
                !principalText.trim() ||
                principalError != null
              }
              onClick={() => void onConfirm()}
            >
              {submitting ? t("addControllerSubmitting") : t("addControllerConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CanisterSuccessDialog
        open={success != null}
        onClose={() => {
          setSuccess(null)
          onOpenChange(false)
        }}
        title={t("addControllerSuccessTitle")}
        monoId={success?.principal}
        detail={
          success ? (
            <p className="text-sm text-muted-foreground">{t("addControllerSuccessBody")}</p>
          ) : null
        }
      />
    </>
  )
}
