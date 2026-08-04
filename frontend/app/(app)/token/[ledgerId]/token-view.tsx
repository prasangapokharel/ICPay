"use client"

import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Alert02Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { copyText, formatTokenAmount } from "@/lib/wallet-utils"
import { icrc1Account, toHex } from "@/lib/account-id"
import { useTokenHolding, useDepositAddress } from "@/hooks/use-wallet-data"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"

export function TokenView() {
  const t = useTranslations("token")
  const pathname = usePathname()
  const router = useRouter()

  // Read from the path, not useParams: under output "export" this component is
  // served as the /token/token shell via a rewrite, so useParams would report
  // "token" for every ledger. The segment count is checked because this view
  // stays mounted for a frame while Next transitions back to /wallet.
  const segments = pathname.split("/").filter(Boolean)
  const ledgerId = segments.length > 1 ? decodeURIComponent(segments[segments.length - 1]) : ""

  const { token, isLoading } = useTokenHolding(ledgerId || null)
  const { data: deposit } = useDepositAddress()

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

  return (
    <div className="space-y-6 pt-2">
      <BackButton onClick={() => router.push("/wallet")} label={t("back")} />

      <div className="flex flex-col items-center gap-3 text-center">
        <TokenLogo token={token} className="size-14" />
        <div>
          {/* Full precision here, unlike the wallet list: ckETH's 18 decimals put
              a real balance below the list's 6-digit cutoff, where it rendered as
              "<0.000001" and read as empty. */}
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatTokenAmount(token.balance, token.decimals, token.decimals)}
          </p>
          <p className="text-sm font-medium text-muted-foreground">{token.symbol}</p>
        </div>
        <p className="text-xs text-muted-foreground">{token.name}</p>
      </div>

      {/* Only ICP is spendable from this wallet: the send form prices its fee and
          parses its amount in e8s, so pointing it at an 18-decimal ledger would
          misread the amount. Other tokens are receive-only until it is generalised. */}
      {isIcp && (
        <Button className="w-full" onClick={() => router.push("/transfer")}>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
          {t("send")}
        </Button>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">{t("depositTitle")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("depositSubtitle", { symbol: token.symbol })}
          </p>
        </div>

        {icrcAddress ? (
          <>
            <DepositAddressCard
              icrcAddress={icrcAddress}
              // Account identifiers only exist on the ICP ledger, so the legacy
              // tab is offered there and nowhere else.
              accountId={isIcp ? deposit?.accountId : undefined}
              logo={token.logo}
              onCopy={copyText}
            />
            <AccountBreakdown
              owner={deposit!.address.owner.toText()}
              subaccount={toHex(Uint8Array.from(deposit!.address.subaccount[0] ?? []))}
            />
          </>
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
    </div>
  )
}

// The two halves of the ICRC-1 address above, shown but deliberately not
// copyable. A custodial deposit is only credited when it carries the subaccount,
// so a user who copies the bare owner principal sends to the canister's default
// account and the funds are unattributable.
function AccountBreakdown({ owner, subaccount }: { owner: string; subaccount: string }) {
  const t = useTranslations("token")
  return (
    <div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
      <Field label={t("owner")} value={owner} />
      <Field label={t("subaccount")} value={subaccount} />
      <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
        {t("breakdownHint")}
      </p>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="break-all font-mono text-xs leading-relaxed">{value}</p>
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
