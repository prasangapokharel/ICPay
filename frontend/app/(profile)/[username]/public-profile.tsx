"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Principal } from "@icp-sdk/core/principal"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { Copy01Icon, Tick02Icon, UserQuestion01Icon } from "@hugeicons/core-free-icons"
import { PayQr } from "@/components/profile/pay-qr"
import { QuickPayDrawer } from "@/components/profile/quick-pay-drawer"
import { avatarUriFor } from "@/lib/avatar"
import { profileUrlFor } from "@/lib/profile-url"
import { parsePaymentLink } from "@/services/pay/pay"
import { copyText, formatE8s } from "@/lib/wallet-utils"
import { accountIdentifier, icrc1Account } from "@/lib/account-id"
import { isPossibleHandle, isReservedHandle } from "@/lib/reserved-handles"
import { useResolvedUsername, useLiveBalance, useRefreshWallet } from "@/hooks/use-wallet-data"
import { useRewrittenLastSegment } from "@/lib/rewritten-route"
import { custodialSubaccount } from "@/services/tokens"
import { WALLET_CANISTER_ID } from "@/services/icp"
import { tip } from "@/services/transfer/transfer"
import { useAuth } from "@/components/auth/auth-provider"

type PayRequest = { amount: bigint; memo?: string }

export function PublicProfile() {
  const t = useTranslations("publicProfile")
  const raw = useRewrittenLastSegment()
  const username = raw.toLowerCase()
  const { identity, isAuthenticated, login } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [payOpen, setPayOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [legacy, setLegacy] = useState(false)

  // A payment link names the amount and the reason, so this visitor is not
  // browsing a profile -- they were handed a bill. useSearchParams would need a
  // Suspense boundary under output "export"; the query is read off the live
  // location instead, after mount so it cannot mismatch the prerendered HTML.
  //
  // null means the URL has not been read yet, which is also what keeps the
  // prerendered /u shell from claiming every profile is unclaimed: at build time
  // the path is the placeholder, not the visitor's handle.
  const [read, setRead] = useState<{ request: PayRequest | null } | null>(null)
  useEffect(() => {
    const req = parsePaymentLink(window.location.href)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRead({ request: req?.amount ? { amount: req.amount, memo: req.memo } : null })
  }, [])
  const request = read?.request ?? null

  // A name outside the backend's shape, or one that shadows a real page, can
  // never have been claimed -- so it is resolved as a bad link without paying
  // for a lookup.
  const claimable = isPossibleHandle(username) && !isReservedHandle(username)
  const { principal, isLoading } = useResolvedUsername(claimable ? username : "")

  // The custodial deposit account, not the bare principal: funds sent to the
  // principal itself land outside the subaccount the canister credits. Derived
  // here because getDepositAddress is scoped to its caller and a visitor is
  // anonymous.
  //
  // Both encodings name that same account -- ICRC-1 for ICP wallets, the legacy
  // identifier for exchanges that will not take the long form.
  const subaccount = principal ? custodialSubaccount(Principal.fromText(principal)) : undefined
  const canister = Principal.fromText(WALLET_CANISTER_ID)
  const payAddress = !subaccount
    ? ""
    : legacy
      ? accountIdentifier(canister, subaccount)
      : icrc1Account(canister, subaccount)

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

  // The spinner covers hydration too, not just the lookup: the shell is
  // prerendered at the placeholder handle, so rendering before mount would bake
  // "unclaimed" into the HTML of every real profile and flash it on load.
  if (!read || !username || (claimable && isLoading)) return <ProfileLoading />

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

      <h1 className="flex items-center gap-1.5 pt-4 text-2xl font-bold tracking-tight">
        {username}
        <PremiumBadge name={username} className="size-5" />
      </h1>
      <p className="pt-1 text-sm text-muted-foreground">
        {request ? t("requestTagline") : t("tagline")}
      </p>

      {/* A payment link already answers what to send and what for, so the QR and
          the raw account -- both answers to "where do I send it" -- would only be
          asking the payer to solve a problem they no longer have. */}
      {request && !isSelf ? (
        <div className="mt-8 w-full space-y-3 rounded-2xl bg-muted/40 p-6 text-center">
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {formatE8s(request.amount)}
          </p>
          <p className="text-xs text-muted-foreground">ICP</p>
          {request.memo && <p className="border-t pt-3 text-sm">{request.memo}</p>}
        </div>
      ) : (
        <>
          {/* The profile link, not the raw account: a phone camera pointed at an
              ICRC-1 string offers nothing to open, while this lands the payer on
              this page. The exact account still leaves via the copy button below,
              which is what an exchange needs. */}
          <PayQr value={profileUrlFor(username)} className="pt-8" />

          <Button
            variant="outline"
            onClick={handleCopy}
            aria-label={t("copyAddress")}
            className="mt-7 h-auto w-full justify-start gap-3 rounded-2xl bg-muted/40 p-4 text-left hover:bg-muted"
          >
            <span className="min-w-0 flex-1 truncate font-mono text-xs">
              {payAddress.slice(0, 14)}…{payAddress.slice(-10)}
            </span>
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className={copied ? "size-4 shrink-0 text-primary" : "size-4 shrink-0 text-muted-foreground"}
            />
          </Button>

          {/* Both forms address the same custodial subaccount, so the choice is
              only about which one the sender's wallet accepts. */}
          <label className="mt-3 flex w-full items-center justify-between gap-3 px-1">
            <span className="text-xs text-muted-foreground">
              {legacy ? t("formatLegacy") : t("formatIcrc")}
            </span>
            <Switch checked={legacy} onCheckedChange={setLegacy} />
          </label>
        </>
      )}

      {isSelf ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("ownLink")}
        </p>
      ) : (
        <Button size="lg" className="mt-6 w-full" onClick={handlePayClick}>
          {request ? t("payAmount", { amount: formatE8s(request.amount) }) : t("pay")}
        </Button>
      )}

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        {t("onlyIcp")}
      </p>

      <Footer />

      <QuickPayDrawer
        open={payOpen}
        onOpenChange={setPayOpen}
        username={username}
        balance={balance}
        request={request ?? undefined}
        onPay={handlePay}
      />
    </main>
  )
}

function Unclaimed({ username }: { username: string }) {
  const t = useTranslations("publicProfile")
  return (
    <main className="flex flex-1 flex-col items-center px-5 pb-10 pt-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon icon={UserQuestion01Icon} className="size-7 text-muted-foreground" />
      </span>

      <h1 className="pt-5 text-xl font-bold tracking-tight">{username}</h1>
      <p className="pt-2 max-w-xs text-sm text-muted-foreground">
        {t("unclaimed")}
      </p>

      <Button
        size="lg"
        className="mt-7 w-full"
        nativeButton={false}
        render={<Link href="/login" />}
      >
        {t("claim", { name: username })}
      </Button>

      <Footer />
    </main>
  )
}

function Footer() {
  const t = useTranslations("publicProfile")
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
      <p className="pt-1 text-[11px] text-muted-foreground">{t("footerTagline")}</p>
    </div>
  )
}

function ProfileLoading() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </main>
  )
}
