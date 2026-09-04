"use client"

import { useEffect, useState } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import { useTranslations } from "next-intl"
import { ChevronDownIcon, ChevronsUpDownIcon } from "lucide-react"
import { LocaleFlag } from "@/components/i18n/locale-flag"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import { fetchDefaultSubnets } from "@/services/canister/createCanister"
import {
  flagCountryCode,
  shortSubnetId,
  type SubnetOption,
} from "@/services/canister/subnetLocations"

export const SUBNET_DEFAULT = "default"

function CountryFlags({ countries, max = 5 }: { countries: string[]; max?: number }) {
  const shown = countries.slice(0, max)
  const rest = countries.length - shown.length
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
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

function TriggerLabel({
  value,
  selected,
  defaultLabel,
}: {
  value: string
  selected: SubnetOption | null
  defaultLabel: string
}) {
  if (value === SUBNET_DEFAULT || !selected) {
    return <span className="truncate text-sm">{defaultLabel}</span>
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <CountryFlags countries={selected.countries} max={4} />
      <span className="truncate font-mono text-xs text-muted-foreground">
        {shortSubnetId(selected.id)}
      </span>
    </span>
  )
}

export function SubnetPicker({
  value,
  onChange,
  identity,
  disabled,
}: {
  value: string
  onChange: (id: string) => void
  identity: Identity | null | undefined
  disabled?: boolean
}) {
  const t = useTranslations("canisterCreate")
  const [open, setOpen] = useState(false)
  const [subnets, setSubnets] = useState<SubnetOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => {
    if (!open || loaded || !identity) return
    let cancelled = false
    setLoading(true)
    void fetchDefaultSubnets(identity)
      .then((list) => {
        if (!cancelled) {
          setSubnets(list)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setSubnets([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, loaded, identity])

  const selected = value === SUBNET_DEFAULT ? null : subnets.find((s) => s.id === value) ?? null

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setDetailId(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-9 w-full justify-between rounded-4xl border-input bg-input/30 px-3 font-normal hover:bg-input/50"
          />
        }
      >
        <TriggerLabel value={value} selected={selected} defaultLabel={t("subnetDefault")} />
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--anchor-width)] max-w-[min(100vw-2rem,28rem)] gap-0 p-1.5 sm:w-96"
      >
        <button
          type="button"
          onClick={() => pick(SUBNET_DEFAULT)}
          className={cn(
            "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted",
            value === SUBNET_DEFAULT && "bg-muted"
          )}
        >
          <span className="text-sm font-medium">{t("subnetDefault")}</span>
          <span className="text-xs text-muted-foreground">{t("subnetDefaultHint")}</span>
        </button>

        <div className="my-1 border-t border-border/50" />

        <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("subnetMore")}
        </p>

        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {loading && (
            <div className="space-y-2 px-2 py-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          )}

          {!loading && subnets.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">{t("subnetLoadEmpty")}</p>
          )}

          {!loading &&
            subnets.map((subnet) => {
              const selectedRow = value === subnet.id
              const detailsOpen = detailId === subnet.id
              return (
                <Collapsible
                  key={subnet.id}
                  open={detailsOpen}
                  onOpenChange={(next) => setDetailId(next ? subnet.id : null)}
                  className={cn("rounded-xl", selectedRow && "bg-muted/70")}
                >
                  <div className="flex items-center gap-0.5 px-1">
                    <button
                      type="button"
                      onClick={() => pick(subnet.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted/80"
                    >
                      <span className="min-w-0 flex-1 space-y-1">
                        {subnet.countries.length > 0 ? (
                          <CountryFlags countries={subnet.countries} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t("subnetCountriesUnknown")}
                          </span>
                        )}
                        <span className="block truncate font-mono text-[10px] text-muted-foreground">
                          {shortSubnetId(subnet.id)}
                        </span>
                      </span>
                    </button>
                    <CollapsibleTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0"
                          aria-label={t("subnetToggleDetails")}
                        />
                      }
                    >
                      <ChevronsUpDownIcon className="size-3.5" />
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="px-2.5 pb-2">
                    <div className="space-y-2 rounded-lg border border-border/50 bg-background/80 px-2.5 py-2 text-xs">
                      <div>
                        <p className="font-medium">{t("subnetIdLabel")}</p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground">
                          {subnet.id}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{t("subnetCountriesLabel")}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {subnet.countries.map((code) => (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-md border border-border/50 px-1.5 py-0.5"
                            >
                              <LocaleFlag
                                country={flagCountryCode(code)}
                                label={code}
                                size="sm"
                                className="rounded-[2px]"
                              />
                              <span className="font-medium">{code}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      {subnet.nodeCount > 0 && (
                        <p className="text-muted-foreground">
                          {t("subnetNodesLabel", {
                            nodes: subnet.nodeCount,
                            countries: subnet.countries.length,
                          })}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
