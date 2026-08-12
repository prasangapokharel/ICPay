"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy01Icon, Delete02Icon, Key01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { BucketIconAction } from "@/components/bucket/bucket-icon-action"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { mapBucketError } from "@/lib/bucket/bucket"
import { copyText } from "@/lib/wallet-utils"
import { useBucketApiKeys } from "@/hooks/use-bucket-api-keys"
import type { ApiKeyCreateResult, ApiKeyPublic } from "@/services/bucket/types"

function permLabel(
  key: ApiKeyPublic,
  t: (key: "apiKeyPermRead" | "apiKeyPermWrite" | "apiKeyPermDelete" | "apiKeyPermNone") => string
) {
  const parts: string[] = []
  if (key.permissions.read) parts.push(t("apiKeyPermRead"))
  if (key.permissions.write) parts.push(t("apiKeyPermWrite"))
  if (key.permissions.delete) parts.push(t("apiKeyPermDelete"))
  return parts.join(" · ") || t("apiKeyPermNone")
}

export function BucketApiKeysModal({
  bucketId,
  open,
  onOpenChange,
}: {
  bucketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const { keys, isLoading, createKey, revokeKey, refresh } = useBucketApiKeys(
    bucketId,
    open
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [read, setRead] = useState(true)
  const [write, setWrite] = useState(true)
  const [del, setDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<ApiKeyCreateResult | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = () => {
    setName("")
    setRead(true)
    setWrite(true)
    setDel(false)
    setError(null)
  }

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    const res = await createKey(name.trim(), { read, write, delete: del })
    setBusy(false)
    if ("err" in res) {
      setError(mapBucketError(res.err, t))
      return
    }
    setCreateOpen(false)
    setCreated(res.ok)
    resetForm()
    await refresh()
  }

  const handleRevoke = async (keyId: string) => {
    setError(null)
    const res = await revokeKey(keyId)
    if ("err" in res) setError(mapBucketError(res.err, t))
    else await refresh()
  }

  const handleCopySecret = async () => {
    if (!created) return
    await copyText(created.secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md gap-3 sm:max-w-lg" showCloseButton>
          <DialogHeader className="gap-1">
            <DialogTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
              {t("apiKeysTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {t("apiKeysHint")}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="max-h-[min(40vh,280px)] overflow-y-auto rounded-xl border">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-5 text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {t("apiKeysEmpty")}
              </p>
            ) : (
              <ul className="divide-y">
                {keys.map((key) => (
                  <li key={key.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{key.name}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {key.keyHint}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{permLabel(key, t)}</p>
                    </div>
                    {key.revoked ? (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {t("apiKeyRevoked")}
                      </Badge>
                    ) : (
                      <BucketIconAction
                        icon={Delete02Icon}
                        label={t("apiKeyRevoke")}
                        destructive
                        onClick={() => handleRevoke(key.id)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              resetForm()
              setCreateOpen(true)
            }}
          >
            {t("apiKeyCreate")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm gap-4" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("apiKeyCreate")}</DialogTitle>
            <DialogDescription className="text-xs">{t("apiKeyCreateHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="api-key-name">{t("apiKeyName")}</Label>
              <Input
                id="api-key-name"
                value={name}
                maxLength={32}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("apiKeyNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("apiKeyPermissions")}</Label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={read} onCheckedChange={(v) => setRead(v === true)} />
                {t("apiKeyPermRead")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={write} onCheckedChange={(v) => setWrite(v === true)} />
                {t("apiKeyPermWrite")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={del} onCheckedChange={(v) => setDel(v === true)} />
                {t("apiKeyPermDelete")}
              </label>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={busy || name.trim().length === 0}
              onClick={handleCreate}
            >
              {busy ? t("apiKeyCreating") : t("apiKeyCreate")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!created} onOpenChange={(next) => !next && setCreated(null)}>
        <DialogContent className="max-w-md gap-3" showCloseButton>
          <DialogHeader className="gap-1">
            <DialogTitle>{t("apiKeyCreatedTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("apiKeyCreatedBody")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 py-2 pl-3 pr-1.5">
            <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[10px] break-all">
              {created?.secret}
            </pre>
            <BucketIconAction
              icon={copied ? Tick02Icon : Copy01Icon}
              label={copied ? tc("copied") : tc("copy")}
              variant="outline"
              onClick={handleCopySecret}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
