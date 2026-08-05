"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowDown01Icon, Alert02Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { copyText, formatTokenAmount } from "@/lib/wallet-utils"
import { icrc1Account } from "@/lib/account-id"
import { useTokenHolding, useDepositAddress, useSelfCustodyBalance, useRefreshWallet } from "@/hooks/use-wallet-data"
import { SelfCustodyCard } from "@/components/wallet/self-custody-card"
import { SendTokenDrawer } from "@/components/wallet/send-token-drawer"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth/auth-provider"
import { transfer } from "@/services/transfer/transfer"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"

export function TokenView() {
  const t = useTranslations("token")
  const pathname = usePathname()
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [sendOpen, setSendOpen] = useState(false)
  // The deposit details stay hidden until the user asks for them: they see the
  // QR and address only after tapping Deposit, so the default view stays focused
  // on the balance, the action buttons, and the custody card below.
  const [showDeposit, setShowDeposit] = useState(false)

  // Read from the path, not useParams: under output "export" this component is
  // served as the /token/token shell via a rewrite, so useParams would report
  // "token" for every ledger. The segment count is checked because this view
  // stays mounted for a frame while Next transitions back to /wallet.
  const segments = pathname.split("/").filter(Boolean)
  const ledgerId = segments.length > 1 ? decodeURIComponent(segments[segments.length - 1]) : ""

  const { token, isLoading } = useTokenHolding(ledgerId || null)
  const { data: deposit } = useDepositAddress()
  const selfCustody = useSelfCustodyBalance(ledgerId || null)

  // An empty id means the mid-transition frame described above, so the skeleton
  // is held rather than asserting the token does not exist.
  if (isLoading || !ledgerId) return <TokenSkeleton />

  if (!token) {
    return (
      <div className="space-y-4 pt-4">
        <BackButton onClick={() => router.push("/wallet")} label={t("back")} />
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isIcp = token.ledgerId === ICP_LEDGER_ID
  // The deposit account is derived from the principal alone, so the same
  // subaccount receives every ICRC-1 token -- only the ledger differs.
  const icrcAddress = deposit
    ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0])
    : ""

  const handleSend = async (username: string, amount: bigint, memo?: string) => {
    const result = await transfer(identity, token.ledgerId, "username", username, amount, memo)
    if ("err" in result) return result.err
    refreshWallet()
    return null
  }

  return (
    <div className="space-y-6 pt-2">
      <BackButton onClick={() => router.push("/wallet")} label={t("back")} />

      <div>
        <div className="flex flex-col items-center gap-3 text-center">
          <TokenLogo token={token} className="size-14" />
          {/* Full precision here, unlike the wallet list: ckETH's 18 decimals put
              a real balance below the list's 6-digit cutoff, where it rendered as
              "<0.000001" and read as empty. */}
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatTokenAmount(token.balance, token.decimals, token.decimals)}
          </p>
          {/* The symbol renders once, cleanly. Some ledgers (ckETH) carry the
              same value in name and symbol, so the separate name line is only
              shown when it is actually distinct. */}
          <p className="text-sm font-medium text-muted-foreground">{token.symbol}</p>
          {token.name !== token.symbol && (
            <p className="text-xs text-muted-foreground">{token.name}</p>
          )}
        </div>

        {/* Send opens the swipe-up drawer; Deposit toggles the collapsible below.
            The collapsible only ever opens through this button (or keyboard
            activation), so the QR + address never appear before the user asks. */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={() => setSendOpen(true)}>
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
            {t("send")}
          </Button>
          <Button className="w-full" onClick={() => setShowDeposit((v) => !v)}>
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
            {t("deposit")}
          </Button>
        </div>
      </div>

      <SendTokenDrawer
        open={sendOpen}
        onOpenChange={setSendOpen}
        token={token}
        onSend={handleSend}
      />

      {/* Rendered even at zero: a card that only appears when funds are stranded
          is indistinguishable from a broken one the rest of the time. Sits above
          the deposit details so custody is always visible on first load. */}
      {selfCustody !== undefined && <SelfCustodyCard token={token} balance={selfCustody} />}

      <Collapsible open={showDeposit} onOpenChange={setShowDeposit} className="w-full">
        {/* keepMounted keeps the panel in the DOM while closed, so toggling
            Deposit animates between the closed and open keyframes instead of
            mounting fresh (base-ui suppresses animation on a first mount). */}
        <CollapsibleContent
          keepMounted
          className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
        >
          <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">{t("depositTitle")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("depositSubtitle", { symbol: token.symbol })}
            </p>
          </div>

          {icrcAddress ? (
            <DepositAddressCard
              icrcAddress={icrcAddress}
              // Account identifiers only exist on the ICP ledger, so the legacy
              // tab is offered there and nowhere else.
              accountId={isIcp ? deposit?.accountId : undefined}
              principal={identity?.getPrincipal().toText()}
              logo={token.logo}
              onCopy={copyText}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="size-52 rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          )}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Alert02Icon} className="mt-px size-3.5 shrink-0" />
            {t("warning", { symbol: token.symbol })}
          </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 gap-1" onClick={onClick}>
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      {label}
    </Button>
  )
}

// ICP ships no icrc1:logo, and its mark is already a local asset.
export function TokenLogo({ token, className }: { token: TokenHolding; className: string }) {
  const src = token.ledgerId === ICP_LEDGER_ID ? "/images/logo/logo.png" : token.logo

  if (!src) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground ${className}`}
      >
        {token.symbol.slice(0, 2)}
      </span>
    )
  }

  return (
    <Image
      // The ledger logos are inline SVG data URIs, which next/image cannot
      // process; unoptimized is already the project-wide default anyway.
      src={src}
      alt=""
      width={56}
      height={56}
      unoptimized
      className={`shrink-0 rounded-full object-contain ${className}`}
    />
  )
}

function TokenSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-8 w-20 rounded-md" />
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="mx-auto size-52 rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}
