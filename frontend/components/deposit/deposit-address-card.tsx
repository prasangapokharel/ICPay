"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

type DepositAddressCardProps = {
  icrcAddress: string
  onCopy: (text: string) => void
  // Account identifiers are an ICP-ledger concept, so the legacy tab only exists
  // when one is supplied. Other ICRC-1 ledgers render the ICRC address alone.
  accountId?: string
  // The user's own principal. Exchanges reject the "-{checksum}.{subaccount}"
  // suffix of the ICRC address, so this is the only form they accept -- funds
  // sent here land in self-custody and need one "Move into ICPay" afterwards.
  principal?: string
  // Centred on the QR. Defaults to the ICP mark, which is a local asset; token
  // pages pass the ledger's own icrc1:logo.
  logo?: string
}

export function DepositAddressCard({
  accountId,
  icrcAddress,
  principal,
  onCopy,
  logo,
}: DepositAddressCardProps) {
  const t = useTranslations("deposit")

  const tabs = [
    { value: "icrc", label: t("tabIcrc"), address: icrcAddress, hint: t("hintIcrc") },
    ...(accountId !== undefined
      ? [{ value: "legacy", label: t("tabLegacy"), address: accountId, hint: t("hintLegacy") }]
      : []),
    ...(principal
      ? [
          {
            value: "principal",
            label: t("tabPrincipal"),
            address: principal,
            hint: t("hintPrincipal"),
          },
        ]
      : []),
  ]

  if (tabs.length === 1) {
    return <AddressBlock value={icrcAddress} hint={t("hintIcrc")} onCopy={onCopy} logo={logo} />
  }

  return (
    <Tabs defaultValue="icrc" className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-5">
          <AddressBlock value={tab.address} hint={tab.hint} onCopy={onCopy} logo={logo} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function AddressBlock({
  value,
  hint,
  onCopy,
  logo,
}: {
  value: string
  hint: string
  onCopy: (text: string) => void
  logo?: string
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
      <QrCode value={value} logo={logo} />

      {/* Address field: a bordered, compact input whose padding comes from the
          Input primitive alone -- no px-/py- overrides here. The read-only value
          truncates into a tail snippet until the user expands it; the trailing
          button cues the click-to-copy action. */}
      <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-input shadow-sm">
        <Input
          readOnly
          value={expanded || !isLong ? value : `${value.slice(0, 26)}…${value.slice(-6)}`}
          aria-label={t("copyAddress")}
          className="min-w-0 flex-1 border-0 font-mono text-xs shadow-none focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t("copyAddress")}
          className="shrink-0 border-l border-input bg-muted/40 px-3 transition-colors hover:bg-muted active:scale-[0.98]"
        >
          {copied ? (
            <HugeiconsIcon icon={Tick02Icon} className="size-4 text-muted-foreground" />
          ) : (
            <HugeiconsIcon icon={Copy01Icon} className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>

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

function QrCode({ value, logo }: { value: string; logo?: string }) {
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
    <div className="relative rounded-2xl border p-3">
      <Image src={src} alt={t("qrAlt")} width={512} height={512} unoptimized className="size-44" />
      <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/10">
        <Image src={logo ?? "/images/logo/logo.png"} alt="" width={40} height={40} unoptimized className="size-6 object-contain" />
      </span>
    </div>
  )
}
