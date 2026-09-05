"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Copy01Icon,
  InformationCircleIcon,
  Package01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { MyCanisterDetails } from "@/components/canister/my-canister-details"
import { MyCanisterRow } from "@/components/canister/my-canister-row"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useMineCanisters } from "@/hooks/canister/useMineCanisters"
import { useMineStatusMap } from "@/hooks/canister/useMineStatusMap"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import {
  displayCanisterLabel,
  forgetCanister,
  rememberCanister,
  shortCanisterId,
} from "@/lib/canister/savedCanisters"
import {
  fetchCanisterIndexMeta,
  subnetLabel,
} from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"
import { parseCanisterId } from "@/services/cycles/topUp"
import { cn } from "@/lib/ui/utils"

function tryParseCanisterId(raw: string): string | null {
  const text = raw.trim()
  if (!text) return null
  try {
    return parseCanisterId(text).toText()
  } catch {
    return null
  }
}

function EmptyBlock({
  message,
  actions,
}: {
  message: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
      <HugeiconsIcon
        icon={Package01Icon}
        className="size-10 text-muted-foreground/40"
      />
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      {actions}
    </div>
  )
}

export function MyCanistersPanel() {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const mine = useMineCanisters(principal)
  const entries = useSavedCanisterEntries(principal)
  const nameById = useMemo(() => new Map(entries.map((e) => [e.id, e.name])), [entries])
  const [picked, setPicked] = useState<string | null>(null)
  const [draftId, setDraftId] = useState("")
  const [draftName, setDraftName] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkedOk, setLinkedOk] = useState<{ id: string; name: string } | null>(null)

  const selected =
    picked && mine.ids.includes(picked) ? picked : mine.ids.length > 0 ? mine.ids[0]! : ""

  const status = useCanisterStatus(
    identity,
    selected,
    Boolean(isAuthenticated && selected)
  )
  const previews = useMineStatusMap(
    identity,
    mine.ids,
    Boolean(isAuthenticated && mine.ids.length > 0)
  )

  const networkMeta = selected ? mine.metaById.get(selected) : undefined
  const { data: indexMeta } = useSWR(
    selected ? (["canister-index-meta", selected] as const) : null,
    ([, id]) => fetchCanisterIndexMeta(id),
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  )
  const meta = indexMeta ?? networkMeta ?? null
  const localName = selected ? nameById.get(selected) ?? "" : ""

  const parsedDraft = useMemo(() => tryParseCanisterId(draftId), [draftId])
  const draftTouched = draftId.trim().length > 0
  const draftValid = parsedDraft != null
  const draftInvalid = draftTouched && !draftValid

  const openLink = () => {
    setDraftName("")
    setLinkOpen(true)
  }

  const onConfirmLink = () => {
    if (!principal || !parsedDraft) return
    const name = draftName.trim()
    rememberCanister(principal, parsedDraft, name)
    setPicked(parsedDraft)
    setDraftId("")
    setDraftName("")
    setLinkOpen(false)
    setLinkedOk({ id: parsedDraft, name })
  }

  const onRemove = (id: string) => {
    if (!principal) return
    forgetCanister(principal, id)
    if (picked === id) setPicked(null)
  }

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={openLink}>
            {t("link")}
          </Button>
          <Button nativeButton={false} render={<Link href="/canister/create" />}>
            {t("create")}
          </Button>
        </div>
      }
    >
      <Alert className="bg-muted/30">
        <HugeiconsIcon icon={InformationCircleIcon} />
        <AlertTitle>{t("yourPrincipal")}</AlertTitle>
        <AlertDescription>
          <p className="break-all font-mono text-xs text-foreground">{principal ?? "—"}</p>
          <p className="mt-1 text-[11px]">{t("principalHint")}</p>
        </AlertDescription>
        {principal ? (
          <AlertAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("copyPrincipal")}
              onClick={() => void navigator.clipboard.writeText(principal)}
            >
              <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
            </Button>
          </AlertAction>
        ) : null}
      </Alert>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="min-w-0 flex-1 gap-0">
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{t("listTitle")}</CardTitle>
              <Badge variant="secondary">{t("count", { count: mine.ids.length })}</Badge>
            </div>
            <CardDescription>{t("listHint")}</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            {mine.isLoading ? (
              <EmptyBlock message={t("loading")} />
            ) : mine.ids.length === 0 ? (
              <EmptyBlock
                message={t("empty")}
                actions={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" variant="outline" onClick={openLink}>
                      {t("link")}
                    </Button>
                    <Button nativeButton={false} render={<Link href="/canister/create" />}>
                      {t("create")}
                    </Button>
                  </div>
                }
              />
            ) : (
              <ul className="space-y-1">
                {mine.ids.map((id) => {
                  const row = mine.metaById.get(id)
                  const savedName = nameById.get(id) ?? ""
                  const label =
                    savedName || row?.name || displayCanisterLabel({ id, name: "" })
                  const hasFlags = Boolean(row?.countries.length)
                  const place = row
                    ? hasFlags
                      ? row.nodeCount > 0
                        ? `${row.nodeCount} nodes`
                        : ""
                      : subnetLabel(row) || shortSubnetId(row.subnetId)
                    : ""
                  return (
                    <MyCanisterRow
                      key={id}
                      id={id}
                      label={label}
                      place={place}
                      countries={row?.countries}
                      selected={selected === id}
                      status={previews.map[id]}
                      statusLoading={previews.isLoading}
                      onSelect={() => setPicked(id)}
                    />
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-1 gap-0 self-start lg:sticky lg:top-20">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">{t("detailTitle")}</CardTitle>
            <CardDescription>
              {selected
                ? localName || meta?.name || shortCanisterId(selected)
                : t("detailEmpty")}
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("pt-4", !selected && "pb-2")}>
            {!selected ? (
              <EmptyBlock message={t("detailEmpty")} />
            ) : (
              <MyCanisterDetails
                canisterId={selected}
                localName={localName}
                meta={meta}
                status={status}
                onCopyId={() => void navigator.clipboard.writeText(selected)}
                onCopyPrincipal={() => {
                  if (principal) void navigator.clipboard.writeText(principal)
                }}
                onRemove={() => onRemove(selected)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={linkOpen}
        onOpenChange={(open) => {
          setLinkOpen(open)
          if (!open) {
            setDraftId("")
            setDraftName("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("linkTitle")}</DialogTitle>
            <DialogDescription>{t("linkHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="link-canister-id">{t("linkId")}</Label>
              <div className="relative">
                <Input
                  id="link-canister-id"
                  value={draftId}
                  onChange={(e) => setDraftId(e.target.value)}
                  placeholder={t("addPlaceholder")}
                  spellCheck={false}
                  aria-invalid={draftInvalid}
                  className={cn(
                    "pr-9 font-mono text-sm",
                    draftValid && "border-emerald-500/60 focus-visible:ring-emerald-500/30",
                    draftInvalid && "border-destructive focus-visible:ring-destructive/30"
                  )}
                />
                {draftTouched && (
                  <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
                    <HugeiconsIcon
                      icon={draftValid ? Tick02Icon : Cancel01Icon}
                      className={cn(
                        "size-3.5",
                        draftValid ? "text-emerald-500" : "text-destructive"
                      )}
                    />
                  </span>
                )}
              </div>
              {draftInvalid ? (
                <p className="text-xs text-destructive">{t("invalidId")}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-canister-name">{t("linkName")}</Label>
              <Input
                id="link-canister-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={t("linkNamePlaceholder")}
                maxLength={48}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              {t("linkCancel")}
            </Button>
            <Button type="button" disabled={!draftValid} onClick={onConfirmLink}>
              {t("linkConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CanisterSuccessDialog
        open={linkedOk != null}
        onClose={() => setLinkedOk(null)}
        title={t("linkSuccessTitle")}
        description={
          linkedOk?.name
            ? t("linkSuccessNamed", { name: linkedOk.name })
            : t("linkSuccessBody")
        }
        monoId={linkedOk?.id}
      />
    </AppPage>
  )
}
