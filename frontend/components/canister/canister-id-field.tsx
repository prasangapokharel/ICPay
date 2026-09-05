"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/ui/utils"
import { listSavedCanisterEntries, shortCanisterId } from "@/lib/canister/savedCanisters"

export function CanisterIdField({
  id,
  value,
  onChange,
  principal,
  disabled,
  error,
  hint,
}: {
  id: string
  value: string
  onChange: (next: string) => void
  principal?: string | null
  disabled?: boolean
  error?: string | null
  hint?: string | null
}) {
  const t = useTranslations("canisterIdField")
  const [open, setOpen] = useState(false)
  const saved = principal ? listSavedCanisterEntries(principal) : []

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{t("label")}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
          autoComplete="off"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 font-mono text-sm"
        />
        {principal && saved.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className="shrink-0 gap-1.5 px-3"
                  aria-label={t("choose")}
                />
              }
            >
              <span className="hidden sm:inline">{t("choose")}</span>
              <ChevronsUpDownIcon className="size-4 opacity-70" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(100vw-2rem,22rem)] p-1">
              <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                {t("yours")}
              </p>
              <ul className="max-h-56 overflow-y-auto">
                {saved.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-muted",
                        value.trim() === entry.id && "bg-muted"
                      )}
                      onClick={() => {
                        onChange(entry.id)
                        setOpen(false)
                      }}
                    >
                      <span className="truncate text-xs font-medium text-foreground">
                        {entry.name || shortCanisterId(entry.id)}
                      </span>
                      <span className="w-full truncate font-mono text-[10px] text-muted-foreground">
                        {entry.id}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {!error && !hint && principal && saved.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("emptyHint")}</p>
      )}
    </div>
  )
}
