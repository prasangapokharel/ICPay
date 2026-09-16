"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft02Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { LaunchForm } from "@/components/launch/launch-form"
import { TokenCard } from "@/components/launch/token-card"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useMyTokens } from "@/hooks/token/useLaunchData"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { launchToken, type LaunchInput } from "@/services/launch/launch"

export default function LaunchPage() {
  const t = useTranslations("launch")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { tokens, isLoading, refresh } = useMyTokens()
  const [showForm, setShowForm] = useState(false)

  const handleLaunch = async (input: LaunchInput): Promise<string | null> => {
    const result = await launchToken(identity, input)
    if ("err" in result) return result.err

    // The fee has left the wallet and the row exists whatever happened after,
    // so both are refreshed before the detail page reads them.
    refreshWallet()
    await refresh()
    router.push(`/launch/${result.ok.id}`)
    return null
  }

  if (showForm) {
    return (
      <AppPage
        title={t("formTitle")}
        description={t("formSubtitle")}
        back={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            className="mb-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} data-icon="inline-start" />
            Back to my tokens
          </Button>
        }
      >
        <LaunchForm onLaunch={handleLaunch} />
      </AppPage>
    )
  }

  const hasTokens = tokens.length > 0

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      actions={
        hasTokens ? (
          <Button onClick={() => setShowForm(true)} size="sm">
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
            {t("createCta")}
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        {isLoading && !hasTokens ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : !hasTokens ? (
          <Empty className="rounded-3xl border border-dashed border-border/60 bg-muted/15 py-14">
            <EmptyMedia variant="icon">
              <HugeiconsIcon
                icon={Coins01Icon}
                className="size-5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-base font-semibold">{t("empty")}</EmptyTitle>
              <EmptyDescription className="text-xs text-muted-foreground">
                Deploy your custom ICRC-1 token on the Internet Computer with zero presale and full decentralization.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowForm(true)}>
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                {t("createCta")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">{t("myTokens")}</h2>
              <Badge variant="outline" className="text-xs">
                {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
              </Badge>
            </div>
            <Card className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
              {tokens.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </Card>
          </div>
        )}
      </div>
    </AppPage>
  )
}
