"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
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
import { CanisterStatusPanel } from "@/components/canister/canister-status-panel"
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

export function SnapshotsCard() {
  const t = useTranslations("canisterSnapshots")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const searchParams = useSearchParams()
  const [canisterId, setCanisterId] = useState(() => searchParams.get("id")?.trim() ?? "")
  const [connecting, setConnecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<SnapshotView[] | null>(null)
  const [confirm, setConfirm] = useState<
    null | { kind: "load" | "delete"; id: string }
  >(null)

  const trimmed = canisterId.trim()
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

  const refreshList = async () => {
    if (!identity || !parsedOk) return
    setBusy(true)
    try {
      setRows(await listSnapshots(identity, trimmed))
    } catch (e) {
      toast.error(formatManageError(e))
      setRows(null)
    } finally {
      setBusy(false)
    }
  }

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
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>{t("formTitle")}</CardTitle>
            <CardDescription>{t("formHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <CanisterIdField
              id="snap-canister"
              value={canisterId}
              onChange={(v) => {
                setCanisterId(v)
                setRows(null)
              }}
              principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
            />

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
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!parsedOk || busy}
                  onClick={() => void refreshList()}
                >
                  {busy && rows === null ? t("loading") : t("list")}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!parsedOk || busy || status.kind !== "ok"}
                  onClick={() => void onTake()}
                >
                  {t("take")}
                </Button>
              </div>
            )}

            {rows && (
              <ul className="space-y-3">
                {rows.length === 0 ? (
                  <li className="text-xs text-muted-foreground">{t("empty")}</li>
                ) : (
                  rows.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3"
                    >
                      <p className="break-all font-mono text-[11px] text-foreground">{row.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.totalSizeLabel} · {row.takenAtLabel}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setConfirm({ kind: "load", id: row.id })}
                        >
                          {t("load")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => setConfirm({ kind: "delete", id: row.id })}
                        >
                          {t("delete")}
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
          </CardContent>
        </Card>

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
