"use client"

import { useTranslations } from "next-intl"
import { LocaleFlag } from "@/components/i18n/locale-flag"
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
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3.5">
      <LocaleFlag country={active.country} label={active.label} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">{t("label")}</p>
        <p className="truncate text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Select
        value={locale}
        onValueChange={(value) => setLocale(value as Locale)}
        items={LOCALES.map((l) => ({ value: l.code, label: l.label }))}
      >
        <SelectTrigger size="sm" aria-label={t("select")} className="max-w-[6.5rem] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="flex items-center gap-2">
                <LocaleFlag country={l.country} label={l.label} />
                {l.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

