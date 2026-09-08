"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type FileSortKey = "name" | "size" | "type"

const SORT_ITEMS: FileSortKey[] = ["name", "size", "type"]

export function BucketFilesToolbar({
  query,
  sort,
  refreshing,
  canWrite,
  onQueryChange,
  onSortChange,
  onRefresh,
}: {
  query: string
  sort: FileSortKey
  refreshing: boolean
  canWrite: boolean
  onQueryChange: (value: string) => void
  onSortChange: (value: FileSortKey) => void
  onRefresh: () => void
}) {
  const t = useTranslations("bucket")
  const items = SORT_ITEMS.map((value) => ({
    value,
    label: t(value === "name" ? "sortName" : value === "size" ? "sortSize" : "sortType"),
  }))

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("filterFiles")}
          className="pl-9"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(value) => {
            if (value === "name" || value === "size" || value === "type") onSortChange(value)
          }}
          items={items}
        >
          <SelectTrigger size="sm" className="w-[8.5rem]" aria-label={t("sortBy")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("refresh")}
          disabled={refreshing}
          onClick={onRefresh}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            className={refreshing ? "size-4 animate-spin" : "size-4"}
            strokeWidth={1.75}
          />
        </Button>
        {canWrite ? (
          <div className="hidden items-center gap-2 lg:flex">
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span className="text-xs text-muted-foreground">+</span>
              <Kbd>A</Kbd>
            </KbdGroup>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span className="text-xs text-muted-foreground">+</span>
              <Kbd>D</Kbd>
            </KbdGroup>
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span className="text-xs text-muted-foreground">+</span>
              <Kbd>F</Kbd>
            </KbdGroup>
          </div>
        ) : null}
      </div>
    </div>
  )
}
