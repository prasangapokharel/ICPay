import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Send Crypto with Zero Gas Fees Using ICPay",
  description:
    "Gasless crypto transactions on the Internet Computer — ICPay wallet users never pay gas. Learn how cycle-based queries and the reverse gas model enable instant crypto payments without ETH fees.",
  alternates: { canonical: "/blog/gasless-crypto-transactions-icpay" },
  openGraph: {
    title: "Gasless Crypto Transactions with ICPay — ICPay Blog",
    description:
      "Stop paying ETH gas fees. ICPay uses ICP cycles so users send crypto without holding a gas token.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function GaslessCryptoPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Product</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          How to Send Crypto with Zero Gas Fees Using ICPay
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          High gas fees on Ethereum and Bitcoin are the number-one reason people abandon crypto
          payments. ICPay solves this with{" "}
          <strong className="text-foreground">gasless crypto transactions</strong> on the Internet
          Computer — you send ICP without buying a gas token, without approving a fee slider, and
          without watching $15 disappear on a $5 transfer.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why gas fees kill crypto payments</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On Ethereum, every transfer costs ETH regardless of what you send. During congestion, a
          simple ERC-20 send can cost more than the payment itself. Bitcoin L1 fees spike during
          mempool congestion. Users must hold a separate gas token, estimate fees correctly, and
          accept that failed transactions still burn money.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For merchants and everyday users, that friction is unacceptable. Gasless crypto
          transactions are not a nice-to-have — they are the baseline for mass adoption.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How ICPay enables zero gas for users</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Internet Computer uses a{" "}
          <Link
            href="/blog/icp-reverse-gas-model"
            className="underline underline-offset-2 hover:text-foreground"
          >
            reverse gas model
          </Link>
          . The canister — ICPay&apos;s backend — prepays compute with{" "}
          <Link
            href="/blog/icp-cycles-explained"
            className="underline underline-offset-2 hover:text-foreground"
          >
            cycles
          </Link>
          , not the user. When you check your balance, search a username, or browse transaction
          history, those are <strong className="text-foreground">queries</strong> — completely free.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICP transfers carry only the standard ICP ledger fee (0.0001 ICP — fractions of a cent).
          There is no separate gas token to buy. The{" "}
          <Link
            href="/blog/best-icp-wallet"
            className="underline underline-offset-2 hover:text-foreground"
          >
            best ICP wallet
          </Link>{" "}
          experience is one where the fee is invisible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Gasless vs. subsidized gas</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Some wallets &quot;subsidize&quot; gas by paying ETH from a company treasury. That model
          breaks when subsidies end or the treasury runs dry. ICPay&apos;s gasless model is
          structural: the protocol charges canisters in cycles (pegged to XDR, not ICP price), and
          queries are free by design. It is not a promotion — it is architecture.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to send gasless crypto on ICPay</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
              Sign in with Internet Identity
            </Link>{" "}
            — passkey, no seed phrase.
          </li>
          <li className="list-decimal">Deposit ICP to your wallet account.</li>
          <li className="list-decimal">
            Send to a username or account ID —{" "}
            <Link
              href="/blog/how-to-send-icp"
              className="underline underline-offset-2 hover:text-foreground"
            >
              full send guide
            </Link>
            .
          </li>
          <li className="list-decimal">Pay only the 0.0001 ICP network fee. No gas token required.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Are ICPay transactions really gasless?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Users never pay gas in a separate token. ICP transfers cost 0.0001 ICP on the ledger.
              Balance checks, username lookups, and browsing history are completely free queries.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">How is this different from Layer 2 gas subsidies?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              L2 subsidies are temporary promotions. ICP&apos;s reverse gas model is protocol-level —
              canisters pay cycles permanently, and queries are never billed.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/icp-reverse-gas-model" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Reverse Gas Model</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Best ICP Wallet</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/login" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Open ICPay</Link>
        </div>
      </section>
    </article>
  )
}
