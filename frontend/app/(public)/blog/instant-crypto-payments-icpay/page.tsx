import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Instant Crypto Payments with ICPay: Send ICP in Seconds, Not Minutes",
  description:
    "Instant crypto payments with ICPay wallet — send ICP by username in seconds with no gas token, no seed phrase, and 0.0001 ICP fees. The fastest way to pay on the Internet Computer.",
  alternates: { canonical: "/blog/instant-crypto-payments-icpay" },
  openGraph: {
    title: "Instant Crypto Payments with ICPay — ICPay Blog",
    description: "Send ICP instantly by username — passkey login, sub-second finality, near-zero fees.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function InstantCryptoPaymentsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Product</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          Instant Crypto Payments with ICPay: Send ICP in Seconds, Not Minutes
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bitcoin takes 10–60 minutes to confirm. Ethereum gas spikes to $50. ICPay delivers{" "}
          <strong className="text-foreground">instant crypto payments</strong> on the Internet
          Computer — sub-second finality, 0.0001 ICP fees, and username sends that feel like Venmo,
          not a blockchain explorer.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What makes ICPay payments instant</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc"><strong className="text-foreground">Sub-second finality.</strong> ICP transfers settle in one consensus round — typically under 2 seconds.</li>
          <li className="list-disc"><strong className="text-foreground">Username sends.</strong> Type @friend instead of a 64-character hex address.</li>
          <li className="list-disc"><strong className="text-foreground">No gas token.</strong>{" "}
            <Link href="/blog/gasless-crypto-transactions-icpay" className="underline underline-offset-2 hover:text-foreground">Gasless queries</Link>{" "}
            — you only pay the 0.0001 ICP ledger fee.
          </li>
          <li className="list-disc"><strong className="text-foreground">Passkey login.</strong> Face ID to open the wallet — no seed phrase delay.</li>
          <li className="list-disc"><strong className="text-foreground">QR pay.</strong> Scan and pay at a merchant or friend&apos;s profile in one tap.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICPay vs other payment methods</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-semibold">Method</th>
                <th className="text-left py-2 pr-3 font-semibold">Speed</th>
                <th className="text-left py-2 pr-3 font-semibold">Fee</th>
                <th className="text-left py-2 font-semibold">Global</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b"><td className="py-2 pr-3 text-foreground font-medium">ICPay (ICP)</td><td className="py-2 pr-3 text-foreground">&lt;2 sec</td><td className="py-2 pr-3 text-foreground">~$0.0003</td><td className="py-2 text-foreground">Yes</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Bitcoin L1</td><td className="py-2 pr-3">10–60 min</td><td className="py-2 pr-3">$1–$50</td><td className="py-2">Yes</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Ethereum</td><td className="py-2 pr-3">12–30 sec</td><td className="py-2 pr-3">$1–$50</td><td className="py-2">Yes</td></tr>
              <tr><td className="py-2 pr-3">Bank wire</td><td className="py-2 pr-3">1–3 days</td><td className="py-2 pr-3">$15–$50</td><td className="py-2">Limited</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to make your first instant payment</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            <Link href="/login" className="underline underline-offset-2 hover:text-foreground">Sign in to ICPay</Link> with Internet Identity.
          </li>
          <li className="list-decimal">Deposit ICP to your wallet (copy your account ID or use a CEX withdrawal).</li>
          <li className="list-decimal">Tap Transfer, enter a username or account ID, set the amount, confirm.</li>
          <li className="list-decimal">Done — the recipient sees it in seconds.</li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Full walkthrough:{" "}
          <Link href="/blog/how-to-send-icp" className="underline underline-offset-2 hover:text-foreground">
            How to send ICP step by step
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why ICPay is the best ICP wallet for payments</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Speed alone does not make a great wallet. ICPay combines instant settlement with on-chain
          custody, passkey security, and a mobile-first UI built for payments — not trading charts.
          That is why it ranks as the{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>{" "}
          for everyday use in 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">How fast are ICPay transfers?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ICP transfers on the Internet Computer finalize in under 2 seconds — faster than
              Bitcoin, comparable to Solana, and without a separate gas token.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Can I pay a merchant with ICPay?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yes. Merchants register a username and share their pay QR or payment link.{" "}
              <Link href="/blog/accept-icp-payments-ecommerce" className="underline underline-offset-2 hover:text-foreground">Merchant guide</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Best ICP Wallet</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/gasless-crypto-transactions-icpay" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Gasless Transactions</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/login" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Open ICPay</Link>
        </div>
      </section>
    </article>
  )
}
