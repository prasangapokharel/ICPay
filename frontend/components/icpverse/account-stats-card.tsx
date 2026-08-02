"use client"

import { useState } from "react"
import { Principal } from "@dfinity/principal"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, copyText, E8S } from "@/lib/wallet-utils"
import { formatUsd, useIcpPrice } from "@/lib/use-icp-price"
import { useAccountStats } from "@/hooks/use-wallet-data"
import { cn } from "@/lib/utils"

export function AccountStatsCard({ principal }: { principal: string }) {
  const { stats, isLoading } = useAccountStats(principal)
  const { price } = useIcpPrice()

  if (isLoading) return <Skeleton className="h-44 w-full rounded-2xl" />
  if (!stats) return null

  const usd = price ? (Number(stats.balance) / Number(E8S)) * price.usd : null

  return (
    <div className="w-full space-y-px overflow-hidden rounded-2xl bg-border font-mono text-xs">
      <div className="grid grid-cols-2 gap-px bg-border">
        <Cell label="Balance" value={`${formatAmount(stats.balance)} ICP`} strong />
        <Cell label="Transactions" value={stats.txCount === 0 ? "—" : String(stats.txCount)} strong />
        <Cell label="Value" value={usd === null ? "—" : `≈ ${formatUsd(usd)}`} />
        <Cell
          label="Since block"
          value={stats.firstBlock === undefined ? "—" : compact(stats.firstBlock)}
        />
      </div>

      <div className="space-y-2 bg-card px-3.5 py-3">
        <CopyRow label="Principal" value={principal} />
        <Row label="Type" value={principalKind(principal)} />
        <Row label="Bytes" value={String(principalBytes(principal))} />
        {stats.lastBlock !== undefined && (
          <Row label="Last block" value={stats.lastBlock.toString()} />
        )}
      </div>
    </div>
  )
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="bg-card px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate tabular-nums", strong && "text-sm font-semibold")}>{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={async () => {
          await copyText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-primary"
      >
        <span className="truncate">{value}</span>
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
          className={cn("size-3.5 shrink-0", copied && "text-primary")}
        />
      </button>
    </div>
  )
}

// A principal's byte length tags what it is: 29 bytes ends in 0x02 for a
// self-authenticating identity backed by a key pair, and canister ids are short
// opaque ones.
function principalKind(text: string): string {
  const n = principalBytes(text)
  if (n === 29) return "self-authenticating"
  if (n === 0) return "anonymous"
  if (n <= 10) return "canister"
  return "opaque"
}

function principalBytes(text: string): number {
  try {
    return Principal.fromText(text).toUint8Array().length
  } catch {
    return 0
  }
}

function compact(n: bigint): string {
  const v = Number(n)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
