"use client"

import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/ui/utils"
import { formatAmount, parseIcp, E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"

const PERCENTAGES = [25, 50, 75, 100]

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
  size,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  balance?: bigint
  maxE8s?: bigint
  size?: "default" | "amount" | "lg" | "xl"
}) {
  const t = useTranslations("common")
  const { price } = useIcpPrice()
  const parsed = parseIcp(value)
  const usd = parsed !== null && price ? (Number(parsed) / Number(E8S)) * price.usd : null
  const fiat = useFiatValue(usd)
  const max = maxE8s ?? 0n
  const canFill = max > 0n

  const setAmount = (e8s: bigint) => onChange(toPlainIcp(e8s))

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {balance !== undefined && (
          <span className="rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
            {t("balance")}{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {formatAmount(balance)} ICP
            </span>
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          id={id}
          size={size ?? "amount"}
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-16"
        />
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={!canFill}
          onClick={() => setAmount(max)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted font-semibold text-primary hover:bg-muted/70 disabled:opacity-40"
        >
          {t("max")}
        </Button>
      </div>

      <div className="flex gap-1.5">
        {PERCENTAGES.map((pct) => (
          <Button
            key={pct}
            type="button"
            variant="outline"
            size="xs"
            disabled={!canFill}
            onClick={() => setAmount((max * BigInt(pct)) / 100n)}
            className={cn(
              "h-7 flex-1 bg-background text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40",
              pct === 100 && "font-semibold text-primary"
            )}
          >
            {pct}%
          </Button>
        ))}
      </div>

      <p className="text-xs tabular-nums text-muted-foreground">
        {fiat.formatted === null
          ? "\u00a0"
          : `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
      </p>
    </div>
  )
}
