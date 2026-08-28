import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ckBTC & ckETH Explained: How Chain-Key Tech Eliminates Cross-Chain Bridge Hacks",
  description:
    "ckBTC vs wBTC — chain-key cryptography makes cross-chain assets safer than wrapped tokens. How secure crypto bridges work on the Internet Computer without custodians.",
  alternates: { canonical: "/blog/ckbtc-cketh-chain-key-security" },
  openGraph: {
    title: "ckBTC & ckETH Chain-Key Security — ICPay Blog",
    description: "Why chain-key tokens eliminate bridge hacks that drained billions from wrapped BTC.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function CkbtcCkethSecurityPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Chain Fusion</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ckBTC &amp; ckETH Explained: How Chain-Key Tech Eliminates Cross-Chain Bridge Hacks
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bridge hacks have stolen over $2 billion from crypto users. Wrapped tokens like wBTC depend
          on custodian multisigs that can be drained. <strong className="text-foreground">ckBTC and
          ckETH</strong> use chain-key cryptography — threshold signing with no single private key —
          making them fundamentally safer than traditional bridge assets.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ckBTC vs wBTC: the core difference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-semibold">Factor</th>
                <th className="text-left py-2 pr-3 font-semibold">ckBTC (chain-key)</th>
                <th className="text-left py-2 font-semibold">wBTC (wrapped)</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b"><td className="py-2 pr-3">Custody</td><td className="py-2 pr-3 text-foreground">IC subnet threshold signing</td><td className="py-2">BitGo multisig</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Key risk</td><td className="py-2 pr-3 text-foreground">Distributed — no single key</td><td className="py-2">Single compromised signer</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Redemption</td><td className="py-2 pr-3 text-foreground">Burn ckBTC → real BTC tx</td><td className="py-2">Request unwrap from custodian</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Transfer speed</td><td className="py-2 pr-3 text-foreground">Seconds (IC finality)</td><td className="py-2">Minutes (ETH gas)</td></tr>
              <tr><td className="py-2 pr-3">Bridge contract</td><td className="py-2 pr-3 text-foreground">None</td><td className="py-2">Required</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How chain-key cryptography works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A subnet on the Internet Computer derives a unique key and splits it across all nodes using
          threshold BLS and ECDSA signatures. No node ever holds the complete private key. When a
          canister needs to sign a Bitcoin or Ethereum transaction, the subnet collectively produces
          a valid signature — the same cryptography that makes{" "}
          <Link
            href="/blog/internet-computer-chain-fusion"
            className="underline underline-offset-2 hover:text-foreground"
          >
            chain fusion
          </Link>{" "}
          possible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why bridge hacks keep happening</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Traditional bridges lock assets in a smart contract and mint a representation on another
          chain. The contract is a honeypot — one bug, one compromised admin key, one infinite-mint
          exploit, and billions vanish. Ronin, Wormhole, Nomad, Poly Network — the list is long
          because the architecture concentrates risk.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chain-key tokens remove the honeypot. The IC signs for Bitcoin and Ethereum natively — no
          lock contract sitting between chains with a billion-dollar bounty on its code.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ckETH and ICRC-2 tokens</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ckETH follows the same model for Ethereum. ckERC-20 tokens extend it to ERC-20 assets on
          Ethereum, all implementing ICRC-2 on the Internet Computer. Trade at IC speed, redeem 1:1
          for the underlying asset.{" "}
          <Link
            href="/blog/ckbtc-without-btc-network-fees"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ckBTC without BTC network fees
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Are ckBTC and ckETH secure?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              They use threshold cryptography instead of custodian multisigs. No single key can
              drain funds. Risk shifts from bridge bugs to subnet consensus security — the same
              model that secures all ICP canisters.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Can chain-key tokens be hacked?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Any system can have vulnerabilities. Chain-key architecture removes the single-point
              bridge contract attack vector that caused most historical cross-chain losses.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/internet-computer-chain-fusion" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Chain Fusion</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">What is ICP</Link>
        </div>
      </section>
    </article>
  )
}
