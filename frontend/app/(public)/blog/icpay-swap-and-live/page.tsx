import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "icpay-swap-and-live"
const TITLE = "ICPay Swap: Trade ICP and ICRC Tokens in Your Wallet | ICPay"
const DESCRIPTION =
  "Exchange ICP and ICRC tokens directly inside your ICPay wallet via ICPSwap. Zero custody friction, live quotes, and subaccount settlement."
const PUBLISHED_AT = "2026-08-17"
const READING_MINUTES = 5

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ICPay Swap",
    "ICP swap",
    "ICPSwap integration",
    "trade ICRC tokens",
    "Internet Computer DEX",
    "swap ICP to ckBTC",
    "crypto swap wallet",
    "gasless swap ICP",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: "ICPay Swap — ICPay Blog",
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: PUBLISHED_AT,
  readingMinutes: READING_MINUTES,
})

export default function IcpaySwapPage() {
  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Product</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          ICPay Swap: Trade Tokens Directly Inside Your Wallet
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay began as a seamless ICP wallet for username-based transfers. With ICPay Swap,
          you can trade ICP and ICRC tokens directly on-chain without leaving the app or handing
          custody to an external centralized exchange.
        </p>
        <p className="text-[11px] text-muted-foreground">August 17, 2026 · {READING_MINUTES} min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How ICPay Swap Works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Swap</strong> exchanges one token for another inside
          your ICPay balance. Select a token you hold, choose the asset you wish to acquire, enter an
          amount, and review the live quote.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quotes are sourced directly from{" "}
          <a
            href="https://icpswap.com"
            className="underline underline-offset-2 hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            ICPSwap
          </a>{" "}
          — the premier decentralized exchange on the Internet Computer. Settlement occurs through
          the same secure custodial subaccount model ICPay already utilizes for deposits and transfers,
          ensuring only your authenticated principal can authorize the operation.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Supported tokens</strong> — ICP alongside ICRC-1 and
            ICRC-2 standard tokens such as ckBTC, ckETH, and ecosystem assets.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Live quotes & transparency</strong> — Rates update
            in real time, displaying expected output, liquidity pool fee, and slippage estimate
            before confirmation.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">One-tap accessibility</strong> — Accessible straight
            from the home dashboard and quick-action drawers.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-Step: Executing a Swap</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            Open <Link href="/swap" className="underline underline-offset-2 hover:text-foreground">ICPay Swap</Link> and authenticate with Internet Identity.
          </li>
          <li className="list-decimal">
            Select the source token you wish to sell and target token you want to receive.
          </li>
          <li className="list-decimal">
            Input the desired amount and inspect the estimated exchange rate and pool fee.
          </li>
          <li className="list-decimal">
            Tap <strong className="text-foreground">Swap</strong> to approve the on-chain trade.
          </li>
          <li className="list-decimal">
            Your balances update automatically upon consensus finalization (~2 seconds).
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">On-Chain Safety & Settlement</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because ICPay trades run through canister smart contracts on the Internet Computer, transactions
          are atomic. If a swap cannot be completed due to price volatility or slippage limits, the transaction
          reverts and tokens remain safely protected in your subaccount.
        </p>
      </section>

      <section className="space-y-3 border-t pt-6">
        <h2 className="text-base font-semibold tracking-tight">Next steps</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ready to trade? Launch the <Link href="/swap" className="underline underline-offset-2 hover:text-foreground">Swap interface</Link>,
          or learn more about how ICP tokens work in our guide to the{" "}
          <Link href="/blog/icrc-1-token-standard" className="underline underline-offset-2 hover:text-foreground">
            ICRC-1 Token Standard
          </Link>{" "}
          and{" "}
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            What is ICP
          </Link>.
        </p>
      </section>
    </article>
  )
}
