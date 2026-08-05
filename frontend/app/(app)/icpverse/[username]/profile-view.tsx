"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TipDrawer } from "@/components/icpverse/tip-drawer"
import { AccountStatsCard } from "@/components/icpverse/account-stats-card"
import { SendSuccess } from "@/components/wallet/send-success"
import { HugeiconsIcon } from "@hugeicons/react"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import {
  ArrowLeft01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  GiftIcon,
} from "@hugeicons/core-free-icons"
import { avatarUriFor } from "@/lib/avatar"
import { copyText, shortPrincipal } from "@/lib/wallet-utils"
import { useResolvedUsername, useLiveBalance, useRefreshWallet, useDashboard } from "@/hooks/use-wallet-data"
import { tip } from "@/services/transfer/transfer"
import { useAuth } from "@/components/auth/auth-provider"

type Tipped = { amount: bigint; blockIndex: bigint; memo?: string }

export function ProfileView() {
  const t = useTranslations("profileView")
  const pathname = usePathname()
  const router = useRouter()
  const { identity } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  // Shares the dashboard cache rather than refetching: the sender's own handle
  // is only needed to stamp the memo.
  const { data: dashboard } = useDashboard()
  const senderUsername = dashboard?.user.username?.[0]
  const [tipOpen, setTipOpen] = useState(false)
  const [tipped, setTipped] = useState<Tipped | null>(null)
  const [copied, setCopied] = useState(false)

  // Read from the path, not useParams: under output "export" this component is
  // served as the /icpverse/profile shell via a rewrite, so useParams would
  // report "profile" for everyone. The segment count is checked because this
  // view stays mounted for a frame while Next transitions back to /icpverse,
  // where popping the last segment would yield "icpverse".
  const segments = pathname.split("/").filter(Boolean)
  const username = segments.length > 1 ? decodeURIComponent(segments[segments.length - 1]) : ""
  const { principal, isLoading } = useResolvedUsername(username)

  const handleCopy = async () => {
    if (!principal) return
    await copyText(principal)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleTip = async (amount: bigint, message?: string): Promise<string | null> => {
    const result = await tip(identity, username, amount, message)
    if ("err" in result) return result.err

    refreshWallet()
    setTipped({ amount, blockIndex: result.ok.blockIndex, memo: message })
    return null
  }

  // An empty username means the mid-transition frame described above. Holding
  // the skeleton avoids asserting the account does not exist.
  if (isLoading || !username) return <ProfileSkeleton />

  if (!principal) {
    return (
      <div className="space-y-4 pt-4">
        <BackButton onClick={() => router.back()} />
        <Alert variant="destructive">
          <AlertDescription>
            {t("notFound", { name: username })}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const isSelf = principal === identity?.getPrincipal().toText()

  if (tipped) {
    return (
      <SendSuccess
        amount={tipped.amount}
        recipient={`@${username}`}
        blockIndex={tipped.blockIndex}
        memo={tipped.memo}
        kind="tip"
        onDone={() => setTipped(null)}
      />
    )
  }

  return (
    <div className="pt-2">
      <BackButton onClick={() => router.back()} />

      <div className="flex flex-col items-center pt-6">
        <Avatar className="size-24">
          <AvatarImage src={avatarUriFor(username)} alt="" />
          <AvatarFallback className="bg-muted text-lg font-medium uppercase">
            {username.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <h1 className="flex items-center gap-1.5 pt-4 text-2xl font-bold">
          {username}
          <PremiumBadge name={username} className="size-5" />
        </h1>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="mt-1.5 text-muted-foreground"
          aria-label={t("copyPrincipal")}
        >
          <span className="font-mono text-xs">{shortPrincipal(principal)}</span>
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
            className={copied ? "size-4 text-primary" : "size-4"}
          />
        </Button>

        {!isSelf && (
          <Button
            size="lg"
            className="mt-6 w-full max-w-56"
            onClick={() => setTipOpen(true)}
          >
            <HugeiconsIcon icon={GiftIcon} className="size-4" />
            {t("tip")}
          </Button>
        )}

        <div className="w-full pt-8">
          <AccountStatsCard principal={principal} />
        </div>
      </div>

      <TipDrawer
        open={tipOpen}
        onOpenChange={setTipOpen}
        username={username}
        senderUsername={senderUsername}
        balance={balance}
        onTip={handleTip}
      />
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  const tc = useTranslations("common")
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="rounded-full bg-background"
      aria-label={tc("back")}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
    </Button>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center pt-12">
      <Skeleton className="size-24 rounded-full" />
      <Skeleton className="mt-4 h-6 w-32" />
      <Skeleton className="mt-2 h-4 w-40" />
      <Skeleton className="mt-6 h-12 w-56 rounded-full" />
    </div>
  )
}
