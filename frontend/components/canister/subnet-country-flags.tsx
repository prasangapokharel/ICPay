"use client"

import { LocaleFlag } from "@/components/i18n/locale-flag"
import { flagCountryCode } from "@/services/canister/subnetLocations"

export function SubnetCountryFlags({
  countries,
  max = 5,
  className,
}: {
  countries: string[]
  max?: number
  className?: string
}) {
  if (countries.length === 0) return null
  const shown = countries.slice(0, max)
  const rest = countries.length - shown.length
  return (
    <span className={className ?? "inline-flex flex-wrap items-center gap-1"}>
      {shown.map((code) => (
        <LocaleFlag
          key={code}
          country={flagCountryCode(code)}
          label={code}
          size="sm"
          className="rounded-[2px]"
        />
      ))}
      {rest > 0 && (
        <span className="text-[10px] font-medium text-muted-foreground">+{rest}</span>
      )}
    </span>
  )
}
