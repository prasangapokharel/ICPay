"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon } from "@hugeicons/core-free-icons"
import ReactCountryFlag from "react-country-flag"
import { LOCALES } from "@/language/config"
import { useLocale } from "@/components/i18n/locale-provider"
import {
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
      >
        <HugeiconsIcon icon={Globe02Icon} className="size-4.5" strokeWidth={1.75} />
      </SelectPrimitive.Trigger>
      <SelectContent align="end">
        {LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <Flag country={l.country} />
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  )
}

// svg mode rather than the emoji default: Windows ships no colour flag glyphs,
// so the emoji path renders as two letter boxes there.
function Flag({ country }: { country: string }) {
  return (
    <ReactCountryFlag
      svg
      countryCode={country}
      aria-hidden
      style={{ width: "1.15rem", height: "1.15rem", borderRadius: "9999px", objectFit: "cover" }}
    />
  )
}
