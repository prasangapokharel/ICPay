"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TipDrawer } from "@/components/icpverse/tip-drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  GiftIcon,
} from "@hugeicons/core-free-icons"
import { avatarUriFor, shortPrincipal } from "@/lib/avatar"
import { shareReceipt } from "@/lib/receipt"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useResolvedUsername, useDashboard, useRefreshWallet } from "@/hooks/use-wallet-data"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "@/components/ui/toast"

export function ProfileView() {
  const pathname = usePathname()
  const router = useRouter()
  const { identity } = useAuth()
  const { price } = useIcpPrice()
  const { data: dashboard } = useDashboard()
  const refreshWallet = useRefreshWallet()
  const [tipOpen, setTipOpen] = useState(false)
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
    try {
      await navigator.clipboard.writeText(principal)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = principal
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleTip = async (amount: bigint, message?: string): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const memoArg = (message ? [message] : []) as [] | [string]
      const result = await actor.transferByUsername(username, amount, memoArg)
      if ("ok" in result) {
        refreshWallet()
        const receipt = {
          amount,
          recipient: `@${username}`,
          blockIndex: result.ok.blockIndex,
          memo: message,
          usdPrice: price?.usd,
        }
        toast.add({
          title: "Tip sent",
          description: `You tipped @${username}.`,
          actionProps: {
            children: "Share",
            onClick: () => {
              // Fire-and-forget: the toast dismisses on click, so there is no
              // element left to show a pending state on.
              void shareReceipt(receipt).catch(() => {
                toast.add({ title: "Could not create receipt" })
              })
            },
          },
        })
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Tip failed"
    }
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
            No ICPay account found for @{username}.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const isSelf = principal === identity?.getPrincipal().toText()

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

        <h1 className="pt-4 text-2xl font-bold">@{username}</h1>

        <button
          type="button"
          onClick={handleCopy}
          className="mt-1.5 flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent active:scale-95"
          aria-label="Copy principal"
        >
          <span className="font-mono text-xs">{shortPrincipal(principal)}</span>
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
            className={copied ? "size-4 text-primary" : "size-4"}
          />
        </button>

        {!isSelf && (
          <Button
            className="mt-6 h-12 w-full max-w-56 text-base"
            onClick={() => setTipOpen(true)}
          >
            <HugeiconsIcon icon={GiftIcon} className="size-4" />
            Tip
          </Button>
        )}
      </div>

      <TipDrawer
        open={tipOpen}
        onOpenChange={setTipOpen}
        username={username}
        balance={dashboard?.icpBalance}
        onTip={handleTip}
      />
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border bg-background transition-colors hover:bg-accent active:scale-95"
      aria-label="Back"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
    </button>
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
