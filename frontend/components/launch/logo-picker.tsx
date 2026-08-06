"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ImageAdd02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LOGO_MAX_BYTES } from "@/lib/launch"
import { cn } from "@/lib/utils"

const SIZE = 128

// The logo is stored inline on the token record and served to every holder, so
// it is downscaled here rather than uploaded: a static export has no server to
// upload to, and a 128px PNG fits the canister's byte cap without one.
async function toLogoDataUri(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("unsupported")

  // Cover, not stretch: a non-square logo squashed to a square reads as a
  // mistake the creator made.
  const scale = Math.max(SIZE / bitmap.width, SIZE / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
  bitmap.close()

  const uri = canvas.toDataURL("image/png")
  if (uri.length > LOGO_MAX_BYTES) throw new Error("tooLarge")
  return uri
}

export function LogoPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null
  onChange: (logo: string | null) => void
  disabled?: boolean
}) {
  const t = useTranslations("launch")
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onChange(await toLogoDataUri(file))
    } catch (e) {
      setError(e instanceof Error && e.message === "tooLarge" ? t("logoTooLarge") : t("logoFailed"))
    } finally {
      setBusy(false)
      // Cleared so re-picking the same file after a failure still fires change.
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/40 transition-colors",
          !disabled && "hover:border-foreground/30"
        )}
      >
        {value ? (
          <Image src={value} alt="" width={SIZE} height={SIZE} className="size-full object-cover" unoptimized />
        ) : (
          <HugeiconsIcon icon={ImageAdd02Icon} className="size-6 text-muted-foreground" />
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Spinner className="size-5" />
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={disabled || busy}
          aria-label={t("logoLabel")}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>

      {value ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || busy}
          onClick={() => {
            onChange(null)
            setError(null)
          }}
          className="h-auto w-24 px-0 text-xs text-muted-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
          {t("logoRemove")}
        </Button>
      ) : (
        <p className="w-24 text-center text-[10px] leading-tight text-muted-foreground">
          {t("logoHint")}
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
