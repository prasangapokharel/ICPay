"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { LOCALES } from "@/language/config"
import { useLocale } from "@/components/i18n/locale-provider"
import { LocaleFlag } from "@/components/i18n/locale-flag"
import { SelectContent, SelectItem } from "@/components/ui/select"

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale()
  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <SelectPrimitive.Root
      value={locale}
      onValueChange={(value) => setLocale(value as (typeof LOCALES)[number]["code"])}
    >
      <SelectPrimitive.Trigger
        aria-label={active.label}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95 sm:size-9"
      >
        <LocaleFlag country={active.country} size="sm" />
      </SelectPrimitive.Trigger>
      <SelectContent align="end">
        {LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <LocaleFlag country={l.country} />
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  )
}
