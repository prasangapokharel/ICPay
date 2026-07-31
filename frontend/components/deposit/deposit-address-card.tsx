"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Copy, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

type DepositAddressCardProps = {
  accountId: string
  icrcAddress: string
  onCopy: (text: string) => void
}

export function DepositAddressCard({ accountId, icrcAddress, onCopy }: DepositAddressCardProps) {
  return (
    <Tabs defaultValue="icrc" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="icrc">ICRC-1</TabsTrigger>
        <TabsTrigger value="legacy">Account ID</TabsTrigger>
      </TabsList>

      <TabsContent value="icrc" className="mt-5">
        <AddressBlock
          value={icrcAddress}
          hint="For ICP wallets — NNS, Oisy, Plug"
          onCopy={onCopy}
        />
      </TabsContent>

      <TabsContent value="legacy" className="mt-5">
        <AddressBlock
          value={accountId}
          hint="For exchanges asking for an account identifier"
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
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <QrCode value={value} />

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy address"
        className="flex w-full items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-left transition-colors hover:bg-muted active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed">{value}</span>
        {copied ? (
          <Check className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Copy className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      <p className="text-center text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function QrCode({ value }: { value: string }) {
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
    <div className="rounded-2xl border bg-white p-3">
      <Image src={src} alt="Deposit address QR code" width={512} height={512} unoptimized className="size-44" />
    </div>
  )
}
