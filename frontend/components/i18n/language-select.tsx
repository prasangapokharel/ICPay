"use client"

import { useTranslations } from "next-intl"
import ReactCountryFlag from "react-country-flag"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LOCALES, type Locale } from "@/language/config"
import { useLocale } from "@/components/i18n/locale-provider"

export function LanguageSelect() {
  const { locale, setLocale } = useLocale()
  const t = useTranslations("language")
  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5">
      <Flag country={active.country} />
      <div className="flex-1">
        <p className="text-sm">{t("label")}</p>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Select
        value={locale}
        onValueChange={(value) => setLocale(value as Locale)}
        items={LOCALES.map((l) => ({ value: l.code, label: l.label }))}
      >
        <SelectTrigger size="sm" aria-label={t("select")} className="shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="flex items-center gap-2">
                <Flag country={l.country} />
                {l.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
