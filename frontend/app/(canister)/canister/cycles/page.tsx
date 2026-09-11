import type { Metadata } from "next"
import Link from "next/link"
import { CyclesWalletCard } from "@/components/canister/cycles-wallet-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Cycles Wallet — Mint & Withdraw | ICPay",
  description:
    "Mint cycles to the cycles ledger from ICP, then withdraw to any canister. Official CMC notify_mint_cycles — no backend.",
  keywords: [
    "cycles ledger",
    "notify_mint_cycles",
    "mint cycles ICP",
    "withdraw cycles",
    "ICPay cycles wallet",
  ],
  alternates: { canonical: `${siteUrl}/canister/cycles` },
  openGraph: {
    title: "Cycles Wallet — ICPay",
    description: "Hold cycles on the ledger and top up canisters when you need to.",
    url: `${siteUrl}/canister/cycles`,
    siteName: "ICPay",
    type: "website",
  },
}

export default function CyclesWalletPage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <CyclesWalletCard />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Mint cycles to the ledger
          </h2>
          <p>
            Unlike direct top-up, mint deposits cycles onto the cycles ledger under your principal.
            Withdraw later into any canister ID.
          </p>
          <p>
            Guide:{" "}
            <Link
              href="/blog/how-to-mint-cycles-ledger"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              How to mint cycles to the cycles ledger
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
