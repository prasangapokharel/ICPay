"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QrCode } from "@/components/shared/qr-code"

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

      {/* The wrapper owns the fill and the rounding; the input and the copy
          button are both transparent and square inside it. The Input primitive
          is rounded-4xl with its own bg, which peeked out of these squarer
          corners as pale slivers and read as a seam against the button. */}
      <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-input bg-input/30 shadow-sm">
        <Input
          readOnly
          value={expanded || !isLong ? value : `${value.slice(0, 26)}…${value.slice(-6)}`}
          aria-label={t("copyAddress")}
          className="min-w-0 flex-1 rounded-none border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"
        />
        <Button
          variant="ghost"
          onClick={handleCopy}
          aria-label={t("copyAddress")}
          className="h-auto shrink-0 rounded-none border-l border-input bg-transparent px-3 text-muted-foreground hover:bg-muted/60"
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-4" />
        </Button>
      </div>

      {isLong && (
        <Button
          variant="link"
          size="xs"
          onClick={() => setExpanded((v) => !v)}
          className="underline underline-offset-2"
        >
          {expanded ? t("showLess") : t("showFull")}
        </Button>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
