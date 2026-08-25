"use client"

import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES, type FiatCurrency } from "@/lib/fiat/config"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"

export function FiatSelector() {
  const { currency, setCurrency } = useFiatCurrency()
  const t = useTranslations("fiat")
  const active = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-sm">
        {active.symbol}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">{t("label")}</p>
        <p className="truncate text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Select
        value={currency}
        onValueChange={(value) => setCurrency(value as FiatCurrency)}
        items={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
      >
        <SelectTrigger size="sm" aria-label={t("select")} className="max-w-[5.5rem] shrink-0">
          <SelectValue>{active.code}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <span className="w-5 text-center">{c.symbol}</span>
                {c.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
