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
  accountId?: string
  principal?: string
  logo?: string
  hideHint?: boolean
}

export function DepositAddressCard({
  accountId,
  icrcAddress,
  principal,
  onCopy,
  logo,
  hideHint = false,
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
    return (
      <DepositQrBlock
        value={icrcAddress}
        hint={hideHint ? undefined : t("hintIcrc")}
        onCopy={onCopy}
        logo={logo}
      />
    )
  }

  return (
    <Tabs defaultValue="icrc" className="w-full gap-0">
      <TabsList variant="line" className="w-full justify-center border-b border-border">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs sm:text-sm">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          <DepositQrBlock
            value={tab.address}
            hint={hideHint ? undefined : tab.hint}
            onCopy={onCopy}
            logo={logo}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export function DepositQrBlock({
  value,
  hint,
  onCopy,
  logo,
}: {
  value: string
  hint?: string
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
    <div className="flex w-full flex-col items-center gap-4">
      <QrCode value={value} logo={logo} />

      <div className="flex w-full max-w-[min(100%,20rem)] items-stretch overflow-hidden rounded-xl border border-input bg-input/30 shadow-sm sm:max-w-[min(100%,22rem)]">
        <Input
          readOnly
          variant="ghost"
          size="auto"
          value={expanded || !isLong ? value : `${value.slice(0, 26)}…${value.slice(-6)}`}
          aria-label={t("copyAddress")}
          className="min-w-0 flex-1 rounded-none font-mono text-xs"
        />
        <Button
          variant="ghost"
          onClick={handleCopy}
          aria-label={t("copyAddress")}
          className="size-8 shrink-0 rounded-none border-l border-input bg-transparent px-0 text-muted-foreground hover:bg-muted/60"
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
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

      {hint && <p className="text-center text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
