"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CanisterStatusPanel } from "@/components/canister/details/canister-status-panel"
import { CanisterIdField } from "@/components/canister/canister-id-field"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import { parseCanisterId } from "@/services/cycles/topUp"
import {
  deleteSnapshot,
  formatManageError,
  listSnapshots,
  loadSnapshot,
  takeSnapshot,
  type SnapshotView,
} from "@/services/canister/management"

export function SnapshotsCard({
  canisterId: fixedCanisterId,
  embedded = false,
  isController: propIsController,
}: {
  canisterId?: string
  embedded?: boolean
  isController?: boolean
} = {}) {
  const t = useTranslations("canisterSnapshots")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const searchParams = useSearchParams()
  const [canisterId, setCanisterId] = useState(
    () => fixedCanisterId ?? searchParams.get("id")?.trim() ?? ""
  )
  const [connecting, setConnecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<SnapshotView[] | null>(null)
  const [confirm, setConfirm] = useState<
    null | { kind: "load" | "delete"; id: string }
  >(null)

  const effectiveId = fixedCanisterId ?? canisterId
  const trimmed = effectiveId.trim()
  const parsedOk = useMemo(() => {
    try {
      if (!trimmed) return false
      parseCanisterId(trimmed)
      return true
    } catch {
      return false
    }
  }, [trimmed])

  const status = useCanisterStatus(
    identity,
    trimmed,
    Boolean(isAuthenticated && parsedOk)
  )

  const canControl =
    propIsController !== undefined
      ? propIsController
      : status.kind === "ok"
        ? status.data.isController
        : null

  const refreshList = async () => {
    if (!identity || !parsedOk) return
    if (canControl === false) {
      toast.error("Your Internet Identity is not a controller of this canister.")
      return
    }
    setBusy(true)
    try {
      const list = await listSnapshots(identity, trimmed)
      setRows(list)
    } catch (e) {
      toast.error(formatManageError(e))
      setRows(null)
    } finally {
      setBusy(false)
    }
  }

  // Auto load snapshots when fixed canister ID is provided and user is controller
  useEffect(() => {
    if (!fixedCanisterId || !identity || !isAuthenticated || !parsedOk || canControl === false) return
    let cancelled = false
    void (async () => {
      try {
        const list = await listSnapshots(identity, trimmed)
        if (!cancelled) setRows(list)
      } catch {
        // Silent failure on initial background load to avoid unsolicited toast errors
        if (!cancelled) setRows(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fixedCanisterId, identity, isAuthenticated, parsedOk, trimmed, canControl])

  const onTake = async () => {
    if (!identity) return
    setBusy(true)
    try {
      const snap = await takeSnapshot(identity, trimmed)
      toast.success(t("toastTaken"))
      rememberCanister(identity.getPrincipal().toText(), trimmed)
      setRows((prev) => [snap, ...(prev ?? [])])
      status.refresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(false)
    }
  }

  const onConfirm = async () => {
    if (!identity || !confirm) return
    const { kind, id } = confirm
    setConfirm(null)
    setBusy(true)
    try {
      if (kind === "load") {
        await loadSnapshot(identity, trimmed, id)
        toast.success(t("toastLoaded"))
        status.refresh()
      } else {
        await deleteSnapshot(identity, trimmed, id)
        toast.success(t("toastDeleted"))
        setRows((prev) => (prev ?? []).filter((r) => r.id !== id))
        status.refresh()
      }
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(false)
    }
  }

  const content = (
    <Card className="gap-0 border-border/60 bg-card/60 backdrop-blur-xs">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">{t("formTitle")}</CardTitle>
            <CardDescription className="text-xs">{t("formHint")}</CardDescription>
          </div>
          {isAuthenticated && parsedOk && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                disabled={busy || canControl === false}
                onClick={() => void refreshList()}
              >
                <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                <span>{busy && rows === null ? t("loading") : t("list")}</span>
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!parsedOk || busy || status.kind !== "ok" || canControl === false}
                onClick={() => void onTake()}
              >
                <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                <span>{t("take")}</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {!fixedCanisterId && (
          <CanisterIdField
            id="snap-canister"
            value={canisterId}
            onChange={(v) => {
              setCanisterId(v)
              setRows(null)
            }}
            principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
          />
        )}

        {canControl === false && isAuthenticated && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Controller access required</p>
            <p>
              Your Internet Identity is not a controller of this canister. To list, create, or restore snapshots, add your principal as a controller under the Settings tab.
            </p>
          </div>
        )}

        {!isAuthenticated ? (
          <Button
            size="lg"
            className="w-full"
            disabled={isLoading || connecting}
            onClick={() => {
              setConnecting(true)
              void login().finally(() => setConnecting(false))
            }}
          >
            {connecting || isLoading ? t("connecting") : t("signIn")}
          </Button>
        ) : null}

        {canControl !== false && rows && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available Snapshots ({rows.length})
            </h4>
            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                {t("empty")}
              </div>
            ) : (
              <ul className="space-y-3">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5"
                  >
                    <div>
                      <p className="break-all font-mono text-[11px] font-medium text-foreground">{row.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.totalSizeLabel} · {row.takenAtLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={busy}
                        onClick={() => setConfirm({ kind: "load", id: row.id })}
                      >
                        {t("load")}
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => setConfirm({ kind: "delete", id: row.id })}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  )

  if (embedded) {
    return (
      <div className="space-y-4">
        {content}
        <AlertDialog open={confirm != null} onOpenChange={(o) => !o && setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirm?.kind === "load" ? t("loadTitle") : t("deleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirm?.kind === "load" ? t("loadBody") : t("deleteBody")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void onConfirm()}>
                {confirm?.kind === "load" ? t("load") : t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:gap-10">
      <header className="flex flex-col gap-3 text-center lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base lg:mx-0">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        {content}

        <Card className="gap-0 lg:sticky lg:top-20">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">{t("statusTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <CanisterStatusPanel state={status} compact />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirm != null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "load" ? t("loadTitle") : t("deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "load" ? t("loadBody") : t("deleteBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onConfirm()}>
              {confirm?.kind === "load" ? t("load") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
