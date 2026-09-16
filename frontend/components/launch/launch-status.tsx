"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  Alert02Icon,
  Copy01Icon,
  Tick02Icon,
  ShieldKeyIcon,
  LinkSquare02Icon,
  FuelStationIcon,
  ArrowUpDownIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { MyCanisterTopupDialog } from "@/components/canister/details/my-canister-topup-dialog"
import { statusOf, failureReason } from "@/services/launch/launch"
import { formatCycles } from "@/services/cycles/topUp"
import type { TokenPublic } from "@/services/types"
import { copyText, formatTokenAmount, formatTime } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

const SOCIALS = ["website", "telegram", "twitter"] as const

function toHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function LaunchStatus({ token }: { token: TokenPublic }) {
  const t = useTranslations("launch")
  const status = statusOf(token)
  const reason = failureReason(token)
  const [logo] = token.logo
  const [ledgerId] = token.ledgerId
  const [moduleHash] = token.moduleHash
  const [cyclesFunded] = token.cyclesFunded
  const [topUpOpen, setTopUpOpen] = useState(false)
  const creatorPrincipal = token.creator ? (typeof token.creator === "string" ? token.creator : token.creator.toText()) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {logo ? (
            <Image src={logo} alt="" width={64} height={64} className="size-full object-cover" unoptimized />
          ) : (
            <HugeiconsIcon icon={Coins01Icon} className="size-7 text-muted-foreground" strokeWidth={1.75} />
          )}
        </span>

        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{token.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{token.symbol}</span>
          </div>
          <Badge
            variant={status === "failed" ? "destructive" : status === "active" ? "secondary" : "outline"}
            className={cn(status === "pending" && "animate-pulse")}
          >
            {status === "pending" && <Spinner className="size-3" />}
            {t(`status.${status}`)}
          </Badge>
        </div>
      </div>

      {status === "pending" && (
        <Alert>
          <AlertDescription>{t("pendingBody")}</AlertDescription>
        </Alert>
      )}

      {/* The reason is shown, not summarised. A creator who paid and got nothing
          needs the actual trap message to hand to support, and the payment block
          below is what makes the charge traceable. */}
      {status === "failed" && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" strokeWidth={1.75} />
          <AlertDescription className="flex flex-col gap-1">
            <span className="block">{t("failedBody")}</span>
            {reason && <span className="block font-mono text-xs break-all">{reason}</span>}
          </AlertDescription>
        </Alert>
      )}

      {token.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{token.description}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <Row label={t("supplyLabel")} value={`${formatTokenAmount(token.totalSupply, token.decimals, 0)} ${token.symbol}`} />
        <Row label={t("decimalsLabel")} value={String(token.decimals)} />
        {cyclesFunded != null && (
          <Row
            label="Initial Cycles Funded"
            value={`${formatCycles(cyclesFunded)} Cycles`}
          />
        )}
        <Row label={t("controlLabel")} value={t(token.immutable ? "immutableTitle" : "upgradeableTitle")} />
        <Row label={t("createdLabel")} value={formatTime(token.createdAt)} />
        {creatorPrincipal && <Row label="Creator" value={creatorPrincipal} mono copyable />}
        {ledgerId && <Row label={t("ledgerLabel")} value={ledgerId} mono copyable />}
        {/* Published so a holder can hash the deployed wasm themselves. Without
            it "we deploy the audited code" is a claim, not a check. */}
        {moduleHash && <Row label={t("moduleHashLabel")} value={toHex(moduleHash)} mono copyable />}
      </div>

      {token.immutable && status === "active" && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-border/40 bg-muted/20 p-4">
          <HugeiconsIcon icon={ShieldKeyIcon} className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-muted-foreground">{t("immutableProof")}</p>
        </div>
      )}

      {SOCIALS.some((key) => token[key].length > 0) && (
        <div className="flex flex-wrap gap-2">
          {SOCIALS.map((key) => {
            const [url] = token[key]
            if (!url) return null
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                render={
                  <a href={url} target="_blank" rel="noopener noreferrer nofollow">
                    {t(`${key}Label`)}
                  </a>
                }
              />
            )
          })}
        </div>
      )}

      {ledgerId && (
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Actions & Ecosystem Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="justify-start text-xs font-medium cursor-pointer"
              onClick={() => setTopUpOpen(true)}
            >
              <HugeiconsIcon icon={FuelStationIcon} data-icon="inline-start" strokeWidth={1.75} />
              Top Up Cycles
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs font-medium"
              render={
                <a
                  href={`https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=${ledgerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={ArrowUpDownIcon} data-icon="inline-start" strokeWidth={1.75} />
              Trade on ICPSwap
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs font-medium"
              render={
                <a
                  href={`https://app.icpswap.com/info-tokens/details/${ledgerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={InformationCircleIcon} data-icon="inline-start" strokeWidth={1.75} />
              ICPSwap Token Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs font-medium"
              render={
                <a
                  href={`https://dashboard.internetcomputer.org/canister/${ledgerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" strokeWidth={1.75} />
              IC Dashboard Explorer
            </Button>
          </div>
        </div>
      )}

      {ledgerId && (
        <MyCanisterTopupDialog
          open={topUpOpen}
          onOpenChange={setTopUpOpen}
          canisterId={ledgerId}
        />
      )}
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  copyable,
}: {
  label: string
  value: string
  mono?: boolean
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-start gap-1.5">
        <span className={cn("min-w-0 break-all text-right text-sm text-foreground", mono && "font-mono text-xs")}>
          {value}
        </span>
        {copyable && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Copy ${label}`}
            onClick={handleCopy}
            className="-my-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className={cn("size-3.5", copied && "text-primary")}
              strokeWidth={1.75}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
