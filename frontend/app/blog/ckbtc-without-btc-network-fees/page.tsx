import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Send and Receive Bitcoin (ckBTC) Without Paying BTC Network Fees",
  description:
    "ckBTC payments on the Internet Computer — send Bitcoin at layer-1 speed without BTC network fees or bridges. Zero-bridge Bitcoin using chain-key threshold cryptography.",
  alternates: { canonical: "/blog/ckbtc-without-btc-network-fees" },
  openGraph: {
    title: "ckBTC Without BTC Network Fees — ICPay Blog",
    description: "Send and receive Bitcoin on ICP as ckBTC — fast, cheap, no bridge hacks.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function CkbtcWithoutFeesPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Chain Fusion</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          How to Send and Receive Bitcoin (ckBTC) Without Paying BTC Network Fees
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bitcoin L1 fees spike during congestion — sometimes costing more than the payment.{" "}
          <strong className="text-foreground">ckBTC</strong> is native Bitcoin held by Internet
          Computer canisters via threshold cryptography. Transfers settle in seconds at IC speed, with
          no bridge contract and no wrapped-token custodian.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What is ckBTC?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ckBTC is a 1:1 on-chain representation of Bitcoin on the Internet Computer. Real BTC sits
          in a canister-controlled address on the Bitcoin network. When you hold ckBTC, you hold a
          claim on that BTC — minted and burned entirely on the IC, not locked in a third-party
          bridge.{" "}
          <Link
            href="/blog/ckbtc-cketh-chain-key-security"
            className="underline underline-offset-2 hover:text-foreground"
          >
            How chain-key security works
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why ckBTC beats L1 Bitcoin for payments</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc"><strong className="text-foreground">Speed.</strong> ckBTC transfers finalize in seconds, not 10–60 minutes.</li>
          <li className="list-disc"><strong className="text-foreground">Cost.</strong> IC cycle costs are fractions of a cent — not $5–$50 BTC fees.</li>
          <li className="list-disc"><strong className="text-foreground">No bridge.</strong> Threshold signing replaces lock-and-mint bridge contracts.</li>
          <li className="list-disc"><strong className="text-foreground">Redeemable.</strong> Burn ckBTC and receive real BTC on the Bitcoin network.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Zero-bridge Bitcoin explained</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Traditional wrapped Bitcoin (wBTC) locks BTC in a custodian&apos;s multisig and issues a
          token on Ethereum. One compromised key drains billions. ckBTC uses{" "}
          <Link
            href="/blog/internet-computer-chain-fusion"
            className="underline underline-offset-2 hover:text-foreground"
          >
            chain fusion
          </Link>{" "}
          — the IC subnet collectively signs Bitcoin transactions with a key that never exists in one
          place. That is <strong className="text-foreground">zero-bridge Bitcoin</strong>: no
          middleman contract, no custodian promise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to use ckBTC with ICPay</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay is built for ICP and ICRC-1 tokens today, with the Internet Computer&apos;s full
          chain-key token ecosystem expanding. Hold ICP in the{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>
          , and as ckBTC ICRC-2 support grows across IC apps, the same passkey login and username
          sends apply — no seed phrase, no BTC fee estimation.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            Open ICPay
          </Link>{" "}
          ·{" "}
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            What is ICP
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Is ckBTC real Bitcoin?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ckBTC is backed 1:1 by BTC held in canister-controlled addresses on the Bitcoin
              network. Burning ckBTC releases real BTC — it is not a synthetic or algorithmic token.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Do I pay BTC network fees on ckBTC transfers?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ckBTC transfers on the Internet Computer use IC cycles, not BTC miner fees. You only
              pay Bitcoin L1 fees when depositing or withdrawing to/from the Bitcoin network.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/ckbtc-cketh-chain-key-security" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">ckBTC & ckETH Security</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/internet-computer-chain-fusion" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Chain Fusion</Link>
        </div>
      </section>
    </article>
  )
}
