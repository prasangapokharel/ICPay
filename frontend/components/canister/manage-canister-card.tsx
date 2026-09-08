"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
import { CyclesFlowPreview } from "@/components/cycles/cycles-flow-preview"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import { parseCanisterId, verifyCanisterExists } from "@/services/cycles/topUp"
import {
  fetchCanisterLogs,
  formatManageError,
  startCanister,
  stopCanister,
} from "@/services/canister/management"

export function ManageCanisterCard() {
  const t = useTranslations("canisterManage")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const searchParams = useSearchParams()
  const [canisterId, setCanisterId] = useState(() => searchParams.get("id")?.trim() ?? "")
  const [connecting, setConnecting] = useState(false)
  const [busy, setBusy] = useState<"start" | "stop" | "logs" | null>(null)
  const [logs, setLogs] = useState<{ idx: string; at: string; text: string }[] | null>(null)
  const [lookup, setLookup] = useState<"ok" | "missing" | null>(null)
  const [stopOpen, setStopOpen] = useState(false)

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
    Boolean(isAuthenticated && parsedOk && lookup !== "missing")
  )

  const onLookup = async (raw: string) => {
    setCanisterId(raw)
    setLogs(null)
    const id = raw.trim()
    if (!id) {
      setLookup(null)
      return
    }
    try {
      parseCanisterId(id)
    } catch {
      setLookup(null)
      return
    }
    const exists = await verifyCanisterExists(id)
    setLookup(exists === "missing" ? "missing" : exists === "ok" ? "ok" : null)
  }

  const run = async (action: "start" | "stop") => {
    if (!identity) return
    setBusy(action)
    try {
      if (action === "start") await startCanister(identity, trimmed)
      else await stopCanister(identity, trimmed)
      toast.success(action === "start" ? t("toastStarted") : t("toastStopped"))
      rememberCanister(identity.getPrincipal().toText(), trimmed)
      status.refresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(null)
    }
  }

  const onLogs = async () => {
    if (!identity) return
    setBusy("logs")
    try {
      const rows = await fetchCanisterLogs(identity, trimmed)
      setLogs(rows)
      if (rows.length === 0) toast.message(t("logsEmpty"))
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(null)
    }
  }

  const canAct = isAuthenticated && parsedOk && lookup !== "missing" && status.kind === "ok"

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
              id="manage-canister-id"
              value={canisterId}
              onChange={(v) => void onLookup(v)}
              principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
              error={
                trimmed && !parsedOk
                  ? t("invalidCanister")
                  : lookup === "missing"
                    ? t("canisterNotFound")
                    : null
              }
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
                  disabled={!canAct || busy !== null}
                  onClick={() => void run("start")}
                >
                  {busy === "start" ? t("starting") : t("start")}
                </Button>
                <Button
                  variant="outline"
                  disabled={!canAct || busy !== null}
                  onClick={() => setStopOpen(true)}
                >
                  {busy === "stop" ? t("stopping") : t("stop")}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!canAct || busy !== null}
                  onClick={() => void onLogs()}
                >
                  {busy === "logs" ? t("loadingLogs") : t("fetchLogs")}
                </Button>
                <Button variant="ghost" nativeButton={false} render={<Link href="/topup" />}>
                  {t("topUpLink")}
                </Button>
                <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setStopOpen(false)
                          void run("stop")
                        }}
                      >
                        {t("stop")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {logs && (
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-3">
                {logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("logsEmpty")}</p>
                ) : (
                  logs.map((row) => (
                    <div key={row.idx} className="space-y-0.5 border-b border-border/40 pb-2 last:border-0">
                      <p className="text-[10px] text-muted-foreground">
                        #{row.idx} · {row.at}
                      </p>
                      <pre className="whitespace-pre-wrap break-all font-mono text-[11px] text-foreground">
                        {row.text || "—"}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <CyclesFlowPreview
            className="hidden lg:flex"
            title={t("previewTitle")}
            rows={[
              { label: t("canisterId"), value: trimmed || "—", mono: true },
              {
                label: t("previewAccess"),
                value:
                  status.kind === "ok"
                    ? t("previewController")
                    : status.kind === "denied" || status.kind === "error"
                      ? t("previewDenied")
                      : status.kind === "loading"
                        ? t("loading")
                        : "—",
              },
            ]}
          />
          <Card className="gap-0 lg:sticky lg:top-[22rem]">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-base">{t("statusTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <CanisterStatusPanel state={status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
