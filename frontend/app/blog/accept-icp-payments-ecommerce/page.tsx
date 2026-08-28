import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Accept ICP and ICRC-1 Tokens on Your E-Commerce Store",
  description:
    "Accept crypto payments with ICP and ICRC-1 token integration. Low-fee ICP payment gateway setup — payment links, QR codes, and username-based checkout for merchants.",
  alternates: { canonical: "/blog/accept-icp-payments-ecommerce" },
  openGraph: {
    title: "Accept ICP & ICRC-1 Payments — ICPay Blog",
    description: "Merchant guide to accepting Internet Computer crypto payments with near-zero fees.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function AcceptIcpPaymentsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Merchants</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          How to Accept ICP and ICRC-1 Tokens on Your E-Commerce Store
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Credit card processors charge 2–3% per transaction. Ethereum gas can exceed the payment
          itself. Accepting <strong className="text-foreground">ICP and ICRC-1 tokens</strong> on
          the Internet Computer costs fractions of a cent per transfer — and ICPay gives merchants
          payment links, QR codes, and username checkout out of the box.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why merchants accept ICP</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Low fees.</strong> ICP ledger transfers cost 0.0001
            ICP — not 2.9% plus thirty cents per sale.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Instant settlement.</strong> ICRC-1 transfers finalize
            in seconds, not three business days.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">No chargebacks.</strong> On-chain payments are final
            once confirmed.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Global reach.</strong> Accept payments from any
            country without a merchant account in each region.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICRC-1 token integration basics</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICRC-1 is the fungible token standard on the Internet Computer — the equivalent of ERC-20
          on Ethereum, but with sub-second finality and predictable fees. Any ICRC-1 token can be
          sent to an account ID or resolved through ICPay usernames.{" "}
          <Link
            href="/blog/icrc-1-token-standard"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ICRC-1 standard explained
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Three ways to accept ICP payments</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            <strong className="text-foreground">Payment link.</strong> Generate a shareable link with
            a fixed amount. Customer opens it, signs in with Internet Identity, and pays in one tap.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">QR code.</strong> Display a pay QR on your checkout
            page or point-of-sale. Customer scans and confirms.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">Username.</strong> Tell customers to send ICP to
            <code className="text-xs"> @yourstore</code> — no 64-character address to copy wrong.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Setup steps for merchants</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
              Create an ICPay account
            </Link>{" "}
            with Internet Identity.
          </li>
          <li className="list-decimal">Register a business username (e.g. @yourstore).</li>
          <li className="list-decimal">Share your pay link or QR on your store checkout page.</li>
          <li className="list-decimal">
            Monitor incoming payments in your ICPay transaction history.
          </li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For developers building custom checkout flows, the{" "}
          <Link
            href="/blog/icpay-bucket-sdk"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ICPay Bucket SDK
          </Link>{" "}
          provides npm, Python, and Go clients for deeper integration.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              What is an ICP payment gateway?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              An ICP payment gateway lets your store accept Internet Computer tokens. ICPay acts as
              both wallet and gateway — payment links, QR codes, and username resolution with no
              third-party processor taking a cut.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Can I accept tokens other than ICP?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Any ICRC-1 token on the Internet Computer can be received at your account ID. ICPay
              Swap supports trading ICRC tokens in-wallet as the ecosystem grows.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/gasless-crypto-transactions-icpay" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Gasless Transactions</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/how-to-send-icp" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">How to Send ICP</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/icrc-1-token-standard" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">ICRC-1 Standard</Link>
        </div>
      </section>
    </article>
  )
}
