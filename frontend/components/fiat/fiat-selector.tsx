"use client"

import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { CURRENCIES, type FiatCurrency } from "@/lib/fiat/config"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"

export function FiatSelector() {
  const { currency, setCurrency } = useFiatCurrency()
  const t = useTranslations("fiat")
  const active = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted font-semibold text-sm">
        {active.symbol}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{t("label")}</p>
        <p className="truncate text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Select
        value={currency}
        onValueChange={(value) => setCurrency(value as FiatCurrency)}
        items={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
      >
        <SelectTrigger size="sm" aria-label={t("select")} className="max-w-[5.5rem] shrink-0 font-mono">
          <SelectValue>{active.code}</SelectValue>
        </SelectTrigger>
        <SelectContent className="w-60 max-h-72 overflow-y-auto p-1">
          {CURRENCIES.map((c) => (
            <SelectItem key={c.code} value={c.code} className="cursor-pointer py-1.5 pl-2.5">
              <Item size="xs" className="w-full gap-2.5 border-0 bg-transparent p-0">
                <ItemMedia>
                  <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/60 text-xs font-semibold text-foreground">
                    {c.symbol}
                  </span>
                </ItemMedia>
                <ItemContent className="min-w-0 flex-1 gap-0 text-left">
                  <ItemTitle className="truncate text-xs font-medium text-foreground leading-tight">
                    {c.label}
                  </ItemTitle>
                  <ItemDescription className="text-[10px] font-mono text-muted-foreground leading-tight">
                    {c.code}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
