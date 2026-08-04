"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

type DepositAddressCardProps = {
  accountId: string
  icrcAddress: string
  onCopy: (text: string) => void
}

export function DepositAddressCard({ accountId, icrcAddress, onCopy }: DepositAddressCardProps) {
  const t = useTranslations("deposit")
  return (
    <Tabs defaultValue="icrc" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="icrc">{t("tabIcrc")}</TabsTrigger>
        <TabsTrigger value="legacy">{t("tabLegacy")}</TabsTrigger>
      </TabsList>

      <TabsContent value="icrc" className="mt-5">
        <AddressBlock
          value={icrcAddress}
          hint={t("hintIcrc")}
          onCopy={onCopy}
        />
      </TabsContent>

      <TabsContent value="legacy" className="mt-5">
        <AddressBlock
          value={accountId}
          hint={t("hintLegacy")}
          onCopy={onCopy}
        />
      </TabsContent>
    </Tabs>
  )
}

function AddressBlock({
  value,
  hint,
  onCopy,
}: {
  value: string
  hint: string
  onCopy: (text: string) => void
}) {
  const t = useTranslations("deposit")
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    onCopy(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isLong = value.length > 48

  return (
    <div className="flex flex-col items-center gap-4">
      <QrCode value={value} />

      <button
        type="button"
        onClick={handleCopy}
        aria-label={t("copyAddress")}
        className="flex w-full items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-left transition-colors hover:bg-muted active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed">
          {expanded || !isLong ? value : `${value.slice(0, 26)}…${value.slice(-6)}`}
        </span>
        {copied ? (
          <HugeiconsIcon icon={Tick02Icon} className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <HugeiconsIcon icon={Copy01Icon} className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-primary underline underline-offset-2"
        >
          {expanded ? t("showLess") : t("showFull")}
        </button>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function QrCode({ value }: { value: string }) {
  const t = useTranslations("deposit")
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setSrc(null)
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: 512 })
      )
      .then((url) => {
        if (active) setSrc(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [value])

  if (!src) return <Skeleton className="size-52 rounded-2xl" />

  return (
    // Literal white, not a theme token: the QR is generated as dark modules on a
    // light field, so scanners need that contrast to hold in dark mode too.
    <div className="relative rounded-2xl border bg-white p-3">
      <Image src={src} alt={t("qrAlt")} width={512} height={512} unoptimized className="size-44" />
      <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/10">
        <Image src="/images/logo/logo.png" alt="" width={40} height={40} className="size-6 object-contain" />
      </span>
    </div>
  )
}
