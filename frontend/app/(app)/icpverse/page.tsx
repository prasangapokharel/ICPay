"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { HugeiconsIcon } from "@hugeicons/react"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { Search01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { avatarUriFor } from "@/lib/profile/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchUsernameProfile } from "@/lib/navigation/prefetchRoute"
import { useUserSearch } from "@/hooks/wallet/useWalletData"
import { useDebounced } from "@/hooks/ui/useDebounced"

export default function IcpversePage() {
  const t = useTranslations("icpverse")
  const tNav = useTranslations("nav")
  const { identity } = useAuth()
  const [search, setSearch] = useState("")
  const debounced = useDebounced(search)
  const { users, isLoading } = useUserSearch(debounced, 10)
  const searching = debounced.trim().length > 0

  return (
    <AppPage title={tNav("icpverse")}>
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-10"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <section className="space-y-1 p-2">
            <h2 className="px-3 pb-2 pt-2 text-sm font-semibold text-muted-foreground">
              {searching ? t("searchResults") : t("suggested")}
            </h2>

            {isLoading && users.length === 0 ? (
              <UserListSkeleton />
            ) : users.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {searching ? t("noneFound", { query: debounced.trim() }) : t("empty")}
              </p>
            ) : (
              users.map((u) => {
                const name = u.username[0]!
                return (
                  <Link
                    key={u.id}
                    href={`/icpverse/${encodeURIComponent(name)}`}
                    prefetch
                    onMouseEnter={() => prefetchUsernameProfile(name, identity)}
                    onFocus={() => prefetchUsernameProfile(name, identity)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 active:scale-[0.99]"
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
                      {u.displayName ? (
                        <p className="truncate text-xs text-muted-foreground">{u.displayName}</p>
                      ) : null}
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
        </CardContent>
      </Card>
    </AppPage>
  )
}

function UserListSkeleton() {
  return (
    <div className="space-y-1 px-2 pb-2">
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
