"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
      <Drawer
        open={open && success == null}
        onOpenChange={(next) => {
          if (!submitting) onOpenChange(next)
        }}
        showSwipeHandle
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserAdd01Icon} className="size-5 text-primary" />
              {t("addControllerTitle")}
            </DrawerTitle>
            <DrawerDescription>{t("addControllerHint")}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
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
                <p className="text-sm text-destructive">{principalError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t("addControllerFullListHint")}</p>
              )}
            </div>
          </div>

          <DrawerFooter className="mt-3">
            <Button
              type="button"
              className="w-full"
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
            <DrawerClose render={<Button variant="outline" disabled={submitting}>{t("topUpCancel")}</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
