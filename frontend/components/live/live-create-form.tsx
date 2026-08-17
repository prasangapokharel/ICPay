"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { Identity } from "@icp-sdk/core/agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createLiveRoom, type LiveVisibility } from "@/services/live/live"

export function LiveCreateForm({ identity }: { identity: Identity | undefined }) {
  const t = useTranslations("live")
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<"open" | "inviteOnly">("open")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!identity || busy) return
    setBusy(true)
    setError(null)
    try {
      const vis: LiveVisibility =
        visibility === "open" ? { open: null } : { inviteOnly: null }
      const result = await createLiveRoom(identity, title.trim(), vis)
      const token = result.inviteToken[0]
      if (token) {
        sessionStorage.setItem(`live:invite:${result.roomId}`, token)
      }
      router.push(`/live/${result.roomId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="live-title">{t("roomTitle")}</Label>
        <Input
          id="live-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("roomTitlePlaceholder")}
          maxLength={80}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={visibility === "open" ? "default" : "outline"}
          onClick={() => setVisibility("open")}
        >
          {t("public")}
        </Button>
        <Button
          type="button"
          variant={visibility === "inviteOnly" ? "default" : "outline"}
          onClick={() => setVisibility("inviteOnly")}
        >
          {t("private")}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" disabled={!title.trim() || busy} onClick={submit}>
        {busy ? t("creating") : t("createRoom")}
      </Button>
    </div>
  )
}
