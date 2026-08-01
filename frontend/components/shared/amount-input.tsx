"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/wallet-utils"
import { formatUsdPrecise, useIcpPrice } from "@/lib/use-icp-price"

const E8S = 100_000_000
const PERCENTAGES = [25, 50, 75, 100]

function parseIcp(v: string): bigint | null {
  const t = v.trim()
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return BigInt(Math.round(n * E8S))
}

function toPlainIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n
  const fraction = (e8s % 100_000_000n).toString().padStart(8, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

export function AmountInput({
  id,
  label,
  value,
  onChange,
  balance,
  maxE8s,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  balance?: bigint
  maxE8s?: bigint
}) {
  const { price } = useIcpPrice()
  const parsed = parseIcp(value)
  const usd = parsed !== null && price ? (Number(parsed) / E8S) * price.usd : null
  const max = maxE8s ?? 0n

  const setAmount = (e8s: bigint) => onChange(toPlainIcp(e8s))

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground">
            Balance{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatAmount(balance)} ICP
            </span>
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 pr-16 text-2xl font-semibold tabular-nums"
        />
        {max > 0n && (
          <button
            type="button"
            onClick={() => setAmount(max)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-muted/70"
          >
            Max
          </button>
        )}
      </div>

      {max > 0n && (
        <div className="flex gap-1.5">
          {PERCENTAGES.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setAmount((max * BigInt(pct)) / 100n)}
              className={cn(
                "h-7 flex-1 rounded-full border border-border bg-background text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                pct === 100 && "font-semibold text-primary"
              )}
            >
              {pct}%
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        {usd === null ? "\u00a0" : `≈ ${formatUsdPrecise(usd)} USD`}
      </p>
    </div>
  )
}
