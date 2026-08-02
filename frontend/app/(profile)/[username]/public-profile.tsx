"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Principal } from "@dfinity/principal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon, UserQuestion01Icon } from "@hugeicons/core-free-icons"
import { PayQr } from "@/components/profile/pay-qr"
import { QuickPayDrawer } from "@/components/profile/quick-pay-drawer"
import { avatarUriFor } from "@/lib/avatar"
import { copyText } from "@/lib/wallet-utils"
import { icrc1Account } from "@/lib/account-id"
import { isPossibleHandle, isReservedHandle } from "@/lib/reserved-handles"
import { useResolvedUsername, useLiveBalance, useRefreshWallet } from "@/hooks/use-wallet-data"
import { custodialSubaccount } from "@/services/tokens"
import { WALLET_CANISTER_ID } from "@/services/icp"
import { tip } from "@/services/transfer/transfer"
import { useAuth } from "@/components/auth/auth-provider"

export function PublicProfile() {
  const pathname = usePathname()
  const { identity, isAuthenticated, login } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [payOpen, setPayOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Read from the path, not useParams: under output "export" this is served as
  // the /u shell via a rewrite, so useParams would report "u" for every visitor.
  const segments = pathname.split("/").filter(Boolean)
  const raw = segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : ""
  const username = raw.toLowerCase()

  // A name outside the backend's shape, or one that shadows a real page, can
  // never have been claimed -- so it is resolved as a bad link without paying
  // for a lookup.
  const claimable = isPossibleHandle(username) && !isReservedHandle(username)
  const { principal, isLoading } = useResolvedUsername(claimable ? username : "")

  // The custodial deposit account, not the bare principal: funds sent to the
  // principal itself land outside the subaccount the canister credits. Derived
  // here because getDepositAddress is scoped to its caller and a visitor is
  // anonymous.
  const payAddress = principal
    ? icrc1Account(
        Principal.fromText(WALLET_CANISTER_ID),
        custodialSubaccount(Principal.fromText(principal))
      )
    : ""

  const handleCopy = async () => {
    if (!payAddress) return
    await copyText(payAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePay = async (amount: bigint, message?: string) => {
    const result = await tip(identity, username, amount, message)
    if ("err" in result) return result.err
    refreshWallet()
    return { blockIndex: result.ok.blockIndex }
  }

  // Signed out, the payment still has to happen somewhere, so the visitor is
  // sent to Internet Identity and returned to this profile rather than dropped
  // on the wallet home.
  const handlePayClick = async () => {
    if (isAuthenticated) {
      setPayOpen(true)
      return
    }
    try {
      await login()
      setPayOpen(true)
    } catch {
      // The II window was dismissed; the QR and address are still usable.
    }
  }

  if (!username || (claimable && isLoading)) return <ProfileSkeleton />

  if (!principal) return <Unclaimed username={raw} />

  const isSelf = principal === identity?.getPrincipal().toText()

  return (
    <main className="flex flex-1 flex-col items-center px-5 pb-10 pt-12">
      <Avatar className="size-24">
        <AvatarImage src={avatarUriFor(username)} alt="" />
        <AvatarFallback className="bg-muted text-lg font-medium uppercase">
          {username.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <h1 className="pt-4 text-2xl font-bold tracking-tight">@{username}</h1>
      <p className="pt-1 text-sm text-muted-foreground">Scan or tap to send ICP</p>

      <PayQr value={payAddress} className="pt-7" />

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy payment address"
        className="mt-6 flex w-full items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-left transition-colors hover:bg-muted active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1 truncate font-mono text-xs">
          {payAddress.slice(0, 12)}…{payAddress.slice(-8)}
        </span>
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          className={copied ? "size-4 shrink-0 text-primary" : "size-4 shrink-0 text-muted-foreground"}
        />
      </button>

      {isSelf ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          This is your payment link. Share it to get paid.
        </p>
      ) : (
        <Button className="mt-4 h-13 w-full text-base" onClick={handlePayClick}>
          Pay
        </Button>
      )}

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Only send ICP to this address. Other tokens will be lost.
      </p>

      <Footer />

      <QuickPayDrawer
        open={payOpen}
        onOpenChange={setPayOpen}
        username={username}
        balance={balance}
        onPay={handlePay}
      />
    </main>
  )
}

function Unclaimed({ username }: { username: string }) {
  return (
    <main className="flex flex-1 flex-col items-center px-5 pb-10 pt-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon icon={UserQuestion01Icon} className="size-7 text-muted-foreground" />
      </span>

      <h1 className="pt-5 text-xl font-bold tracking-tight">@{username}</h1>
      <p className="pt-2 max-w-xs text-sm text-muted-foreground">
        No one holds this username yet, so there is nowhere to send funds.
      </p>

      <Button
        className="mt-7 h-13 w-full text-base"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        Claim @{username}
      </Button>

      <Footer />
    </main>
  )
}

function Footer() {
  return (
    <div className="mt-auto flex flex-col items-center pt-12">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Image
          src="/images/logo/logo.png"
          alt=""
          width={40}
          height={40}
          className="size-5 object-contain"
        />
        ICPay
      </Link>
      <p className="pt-1 text-[11px] text-muted-foreground">Send ICP by username</p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <main className="flex flex-1 flex-col items-center px-5 pt-12">
      <Skeleton className="size-24 rounded-full" />
      <Skeleton className="mt-4 h-7 w-36" />
      <Skeleton className="mt-2 h-4 w-44" />
      <Skeleton className="mt-7 size-44 rounded-2xl" />
      <Skeleton className="mt-6 h-14 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-13 w-full rounded-2xl" />
    </main>
  )
}
