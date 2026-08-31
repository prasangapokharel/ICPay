"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { sanitizeFolderName } from "@/lib/bucket/folderPath"

export function BucketFolderDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => Promise<void>
}) {
  const t = useTranslations("bucket")
  const tCommon = useTranslations("common")
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const safe = sanitizeFolderName(name)

  const reset = () => {
    setName("")
    setError(null)
    setBusy(false)
  }

  const close = () => {
    if (busy) return
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) onOpenChange(true)
        else close()
      }}
    >
      <DialogContent className="gap-4 sm:max-w-sm" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{t("createFolder")}</DialogTitle>
          <DialogDescription>{t("folderHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!safe || busy) return
            setBusy(true)
            setError(null)
            try {
              await onCreate(safe)
              reset()
              onOpenChange(false)
            } catch (e) {
              setError(e instanceof Error ? e.message : t("uploadFailed"))
            } finally {
              setBusy(false)
            }
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("folderName")}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            disabled={busy}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={close}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={!safe || busy} className="min-w-[7.5rem]">
              <span className="inline-flex items-center justify-center gap-2">
                {busy ? <Spinner className="size-4" /> : null}
                {t("createFolder")}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
