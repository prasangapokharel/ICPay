"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  Alert02Icon,
  Copy01Icon,
  LinkSquare02Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { statusOf, failureReason } from "@/services/launch/launch"
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {logo ? (
            <Image src={logo} alt="" width={64} height={64} className="size-full object-cover" unoptimized />
          ) : (
            <HugeiconsIcon icon={Coins01Icon} className="size-7 text-muted-foreground" />
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight">{token.name}</h1>
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
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription className="space-y-1">
            <span className="block">{t("failedBody")}</span>
            {reason && <span className="block font-mono text-xs break-all">{reason}</span>}
          </AlertDescription>
        </Alert>
      )}

      {token.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{token.description}</p>
      )}

      <div className="overflow-hidden rounded-2xl border">
        <Row label={t("supplyLabel")} value={`${formatTokenAmount(token.totalSupply, token.decimals, 0)} ${token.symbol}`} />
        <Row label={t("decimalsLabel")} value={String(token.decimals)} />
        <Row label={t("controlLabel")} value={t(token.immutable ? "immutableTitle" : "upgradeableTitle")} />
        <Row label={t("createdLabel")} value={formatTime(token.createdAt)} />
        {ledgerId && <Row label={t("ledgerLabel")} value={ledgerId} mono copyable />}
        {/* Published so a holder can hash the deployed wasm themselves. Without
            it "we deploy the audited code" is a claim, not a check. */}
        {moduleHash && <Row label={t("moduleHashLabel")} value={toHex(moduleHash)} mono copyable />}
      </div>

      {token.immutable && status === "active" && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-muted/40 p-4">
          <HugeiconsIcon icon={ShieldKeyIcon} className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
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
                    <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                    {t(`${key}Label`)}
                  </a>
                }
              />
            )
          })}
        </div>
      )}

      {ledgerId && (
        <Button
          variant="outline"
          className="w-full"
          render={
            <a
              href={`https://dashboard.internetcomputer.org/canister/${ledgerId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
              {t("viewOnDashboard")}
            </a>
          }
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
  return (
    <div className="flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-start gap-1.5">
        <span className={cn("min-w-0 break-all text-right text-sm", mono && "font-mono text-xs")}>
          {value}
        </span>
        {copyable && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={() => copyText(value)}
            className="-my-1 shrink-0 text-muted-foreground"
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
