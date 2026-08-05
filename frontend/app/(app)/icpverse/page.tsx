"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { Search01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { avatarUriFor } from "@/lib/avatar"
import { isPremiumHandle } from "@/lib/verifed/premium-tick"
import { useUserSearch } from "@/hooks/use-wallet-data"
import { useDebounced } from "@/hooks/use-debounced"

export default function IcpversePage() {
  const t = useTranslations("icpverse")
  const [search, setSearch] = useState("")
  const debounced = useDebounced(search)
  // An empty search matches every username server-side, which is what keeps the
  // list populated before anyone types instead of showing an empty screen.
  const { users, isLoading } = useUserSearch(debounced, 10)

  const searching = debounced.trim().length > 0

  // Paid handles lead the list: they are the scarce tier the username sale
  // issues, so the verified accounts surface before the free ones.
  const sorted = [...users].sort((a, b) => {
    const pa = isPremiumHandle(a.username[0] ?? "") ? 0 : 1
    const pb = isPremiumHandle(b.username[0] ?? "") ? 0 : 1
    return pa - pb
  })

  return (
    <div className="space-y-5 pt-2">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          variant="search"
          size="default"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <section className="space-y-1">
        <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
          {searching ? t("searchResults") : t("suggested")}
        </h2>

        {isLoading && users.length === 0 ? (
          <UserListSkeleton />
        ) : users.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-foreground">
            {searching ? t("noneFound", { query: debounced.trim() }) : t("empty")}
          </p>
        ) : (
          sorted.map((u) => {
            const name = u.username[0]!
            return (
              <Link
                key={u.id}
                href={`/icpverse/${encodeURIComponent(name)}`}
                className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <Avatar className="size-11">
                  <AvatarImage src={avatarUriFor(name)} alt="" />
                  <AvatarFallback className="bg-muted text-xs font-medium uppercase">
                    {name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold">
                    {name}
                    <PremiumBadge name={name} />
                  </p>
                  {u.displayName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {u.displayName}
                    </p>
                  )}
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </Link>
            )
          })
        )}
      </section>
    </div>
  )
}

function UserListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
