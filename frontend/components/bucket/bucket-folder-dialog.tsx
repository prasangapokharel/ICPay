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
import { sanitizeFolderName } from "@/lib/bucket/folderPath"

export function BucketFolderDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void | Promise<void>
}) {
  const t = useTranslations("bucket")
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const safe = sanitizeFolderName(name)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setName("")
          setError(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm" showCloseButton>
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
              setName("")
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
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="submit" disabled={!safe || busy}>
            {t("createFolder")}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
