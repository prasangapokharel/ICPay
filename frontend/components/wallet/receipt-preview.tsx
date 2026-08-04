"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { receiptPng, shareReceipt, type Receipt } from "@/lib/receipt"

// The card is 1080x1480, so it is shown at its own ratio rather than a fixed
// height -- the whole point is that what you see is what gets shared.
const ASPECT = "1080 / 1480"

export function ReceiptPreview({
  open,
  onOpenChange,
  receipt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: Receipt
}) {
  const t = useTranslations("receipt")
  const tc = useTranslations("common")
  const [url, setUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  // Rendered on open rather than on mount so a success screen that is never
  // shared costs nothing. The object URL is revoked on close, since holding it
  // would pin the decoded bitmap for the life of the page.
  useEffect(() => {
    if (!open) return
    let objectUrl: string | null = null
    let cancelled = false

    receiptPng(receipt)
      .then((rendered) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(rendered)
        setBlob(rendered)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
      setBlob(null)
      setError(false)
      setNote(null)
    }
  }, [open, receipt])

  const handleShare = async () => {
    if (!blob) return
    setBusy(true)
    setNote(null)
    try {
      const outcome = await shareReceipt(blob, receipt.blockIndex)
      if (outcome === "shared") onOpenChange(false)
      else if (outcome === "downloaded") setNote(t("saved"))
    } catch {
      setNote(t("shareFailed"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div
          className="overflow-hidden rounded-2xl bg-muted ring-1 ring-border"
          style={{ aspectRatio: ASPECT }}
        >
          {error ? (
            <div className="flex size-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
              {t("renderFailed")}
            </div>
          ) : url ? (
            // Plain img: the source is a blob URL for a canvas we just rendered,
            // and images are unoptimized under static export anyway.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={t("imageAlt")} className="size-full object-contain" />
          ) : (
            <Skeleton className="size-full rounded-none" />
          )}
        </div>

        {note && <p className="text-center text-xs text-muted-foreground">{note}</p>}

        <DialogFooter>
          <Button className="h-12 text-base" onClick={handleShare} disabled={!blob || busy}>
            <HugeiconsIcon icon={Share08Icon} className="size-4" />
            {tc("share")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
