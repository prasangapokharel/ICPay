import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer",
  description:
    "ICRC-1 token standard on the Internet Computer — how ICRC-1 and ICRC-2 tokens work, transfer fees, and ICRC-1 token integration for wallets, DApps, and merchants.",
  alternates: { canonical: "/blog/icrc-1-token-standard" },
  openGraph: {
    title: "ICRC-1 Token Standard Explained — ICPay Blog",
    description: "The fungible token standard for Internet Computer — transfers, fees, and wallet support.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function Icrc1TokenStandardPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Developers</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every blockchain needs a fungible token standard. Ethereum has ERC-20. The Internet
          Computer has <strong className="text-foreground">ICRC-1</strong> — a ledger interface for
          sending, receiving, and querying token balances with predictable fees and sub-second
          finality. If you are building a DApp, integrating payments, or choosing a wallet, you
          need to understand ICRC-1.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What is ICRC-1?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICRC-1 defines a standard interface for fungible token ledgers on the Internet Computer.
          Each token is its own canister implementing the ICRC-1 spec: transfer, balance_of, metadata,
          and fee queries. ICP itself follows ICRC-1 on the official ledger canister. Popular ICRC
          tokens include ckBTC, ckETH, and ecosystem project tokens.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICRC-1 vs ICRC-2</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc"><strong className="text-foreground">ICRC-1</strong> — basic transfers and balance queries. Like ERC-20.</li>
          <li className="list-disc"><strong className="text-foreground">ICRC-2</strong> — adds approve/transfer_from for DEX and DeFi integrations. Like ERC-20 with allowance.</li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chain-key tokens (ckBTC, ckETH) implement ICRC-2, enabling swaps and automated payments
          at IC speed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICRC-1 token integration for merchants</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To accept ICRC-1 tokens, you need an account ID on the Internet Computer. ICPay generates
          one automatically when you sign up. Share your account ID or username — customers send any
          ICRC-1 token to that address.{" "}
          <Link
            href="/blog/accept-icp-payments-ecommerce"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Merchant payment guide
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How ICPay supports ICRC-1</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay natively sends and receives ICP (the primary ICRC-1 token). ICPay Swap extends
          support to ICRC ecosystem tokens via ICPSwap integration. The wallet uses the same
          Internet Identity login and username system regardless of which ICRC token you hold.{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            Open ICPay
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Is ICP an ICRC-1 token?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yes. The official ICP ledger implements ICRC-1. Any wallet supporting ICRC-1 can send
              and receive ICP — including ICPay.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">What are ICRC-1 transfer fees?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Each token canister sets its own fee. ICP charges 0.0001 ICP per transfer. Most ICRC
              tokens charge similarly small amounts — far below Ethereum gas.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/how-to-send-icp" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">How to Send ICP</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/icpay-swap-and-live" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">ICPay Swap</Link>
        </div>
      </section>
    </article>
  )
}
