"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChannelAvatarError, compressChannelAvatar } from "@/lib/community/compressChannelAvatar"
import type { CommunityChannelPublic } from "@/services/community/community"

export function CommunityChannelAvatarPicker({
  channel,
  isOwner,
  onSave,
  onRemove,
}: {
  channel: CommunityChannelPublic
  isOwner: boolean
  onSave: (bytes: Uint8Array) => Promise<string | null>
  onRemove: () => Promise<string | null>
}) {
  const t = useTranslations("community")
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewBytes, setPreviewBytes] = useState<Uint8Array | undefined>()

  if (!isOwner) return null

  const pick = () => inputRef.current?.click()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const bytes = await compressChannelAvatar(file)
      setPreviewBytes(bytes)
      const err = await onSave(bytes)
      if (err) setError(err)
      else setPreviewBytes(undefined)
    } catch (e) {
      setError(e instanceof ChannelAvatarError ? e.message : t("channelAvatarFailed"))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = async () => {
    setBusy(true)
    setError(null)
    const err = await onRemove()
    if (err) setError(err)
    else setPreviewBytes(undefined)
    setBusy(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("channelAvatar")}
      </p>
      <div className="flex items-center gap-3">
        <CommunityAvatar
          seed={channel.slug}
          name={channel.name}
          slug={channel.slug}
          previewBytes={previewBytes}
          className="size-16"
          pixelSize={128}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={pick}>
              {busy ? <Spinner className="size-4" /> : null}
              {t("changeChannelAvatar")}
            </Button>
            {previewBytes && (
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void handleRemove()}>
                {t("removeChannelAvatar")}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("channelAvatarHint")}</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
