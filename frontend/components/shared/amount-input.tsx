"use client"

import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatAmount, parseIcp, E8S } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useFiatValue } from "@/lib/fiat/use-fiat-value"

const PERCENTAGES = [25, 50, 75, 100]

// Not formatAmount: that adds thousands separators and caps at 4 decimals, both
// of which parseIcp rejects when the value is read back out of the field.
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
  const t = useTranslations("common")
  const { price } = useIcpPrice()
  const parsed = parseIcp(value)
  const usd = parsed !== null && price ? (Number(parsed) / Number(E8S)) * price.usd : null
  // The quote follows the currency picked in settings. This read "≈ … USD"
  // regardless of that choice, so a user on NPR saw a number they could not act
  // on -- and one that silently disagreed with the balance card above it.
  const fiat = useFiatValue(usd)
  const max = maxE8s ?? 0n

  const setAmount = (e8s: bigint) => onChange(toPlainIcp(e8s))

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground">
            {t("balance")}{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatAmount(balance)} ICP
            </span>
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          id={id}
          size="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-16"
        />
        {max > 0n && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setAmount(max)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted font-semibold text-primary hover:bg-muted/70"
          >
            {t("max")}
          </Button>
        )}
      </div>

      {max > 0n && (
        <div className="flex gap-1.5">
          {PERCENTAGES.map((pct) => (
            <Button
              key={pct}
              variant="outline"
              size="xs"
              onClick={() => setAmount((max * BigInt(pct)) / 100n)}
              className={cn(
                "h-7 flex-1 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                pct === 100 && "font-semibold text-primary"
              )}
            >
              {pct}%
            </Button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        {fiat.formatted === null
          ? "\u00a0"
          : `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
      </p>
    </div>
  )
}
