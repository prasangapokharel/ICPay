import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Internet Computer Chain Fusion Explained: How ICP Connects to Bitcoin, Ethereum and Solana",
  description:
    "Chain Fusion explained — how Internet Computer canisters hold, sign, and move Bitcoin, Ethereum, and Solana natively using threshold signatures. No bridges, no custodians.",
  alternates: { canonical: "/blog/internet-computer-chain-fusion" },
  openGraph: {
    title: "Internet Computer Chain Fusion Explained — ICPay Blog",
    description:
      "How ICP canisters interact with Bitcoin, Ethereum, and Solana directly — chain-key cryptography, ckBTC, ckETH, and what it removes.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function ChainFusionPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          Internet Computer Chain Fusion Explained
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most cross-chain movement runs through bridges — smart contracts that lock tokens on one
          chain and print a wrapper on another. Chain Fusion is a different approach: the Internet
          Computer reads, holds, and signs for other chains directly, using threshold signatures
          instead of bridges. Here is how it works and why it changes what an app can do.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The bridge problem</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A traditional bridge takes your Bitcoin, locks it in a smart contract controlled by a
          custodian, and issues a wrapped token like wBTC in exchange. That wrapper is a promise —
          it is only worth as much as the people holding the underlying coins. History has been
          unkind: billions of dollars have been stolen from bridges because one buggy contract or
          one compromised key controlled an enormous pile of locked assets.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chain Fusion removes the middleman entirely. Instead of locking Bitcoin somewhere and
          trusting someone, the Internet Computer itself signs Bitcoin transactions. No single
          person, company, or node holds the private key — a subnet collectively signs using
          <strong className="text-foreground"> threshold cryptography</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Chain-key signatures</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The technical foundation is <strong className="text-foreground">chain-key cryptography</strong>.
          The protocol derives a unique key for each canister, splits it across all the nodes of a
          subnet, and lets those nodes produce a signature together — without any node ever seeing
          the complete private key. A subnet can hold a Bitcoin address, an Ethereum account, or a
          Solana wallet, and transact on those chains as if it were a regular user.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Threshold ECDSA</strong> — secp256k1 keys for
            Bitcoin, Ethereum, all EVM chains, Filecoin, and Cosmos.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Threshold Schnorr</strong> — BIP340 for Bitcoin
            Taproot and Ordinals; Ed25519 for Solana, TON, Polkadot, Cardano, and NEAR.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because the key never exists in one place, there is nothing to steal. A bridge&apos;s
          single point of failure becomes a distributed signing service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Chain-key tokens: ckBTC and ckETH</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is what makes chain-key tokens possible. ckBTC is not a wrapped Bitcoin managed by a
          third party — it is a 1:1 on-chain representation of Bitcoin held by a canister-controlled
          address on the Bitcoin network. The minting and burning happen entirely on the Internet
          Computer. Send Bitcoin to your canister address, and ckBTC is minted into your account.
          Send ckBTC out, and the canister signs a real Bitcoin transaction to release the BTC.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The same architecture powers ckETH and ckERC-20 tokens. These chain-key tokens implement
          the ICRC-2 standard, so they move and trade at Internet Computer speed — seconds, not
          minutes — while remaining redeemable 1:1 for the underlying asset.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How a canister connects to other chains</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Two layers make it work. The <strong className="text-foreground">protocol layer</strong>{" "}
          runs adapters — for Bitcoin, nodes run a Bitcoin adapter that speaks the peer-to-peer
          protocol and keeps a canister informed of the latest Bitcoin state. The{" "}
          <strong className="text-foreground">signing layer</strong> lets canisters derive keys and
          request threshold signatures from the protocol.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Bitcoin API</strong> — the Bitcoin canister exposes
            get UTXOs, get balance, and send transaction directly at protocol level.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">EVM RPC canister</strong> — a typed interface to
            Ethereum and EVM-compatible chains, querying multiple RPC providers and returning
            consensus results.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">SOL RPC canister</strong> — the same for Solana.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">HTTPS outcalls</strong> — any chain with an HTTP API
            can be integrated where a direct adapter does not exist.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What apps become possible</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Removing the bridge opens patterns that are difficult or impossible otherwise:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">A multichain wallet</strong> — one canister controls
            addresses on Bitcoin, Ethereum, and Solana at the same time, with a web frontend served
            from the chain itself.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Trustless automation</strong> — a canister watches an
            Ethereum contract and triggers loan liquidations or batch settlements automatically, no
            external keeper service required.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Bitcoin-secured lending</strong> — use Bitcoin as
            collateral, held in a canister-controlled address, and borrow an ICRC-2 stablecoin
            against it.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Tamperproof frontends</strong> — an immutable UI for
            an Ethereum smart contract, hosted on-chain as a certified asset.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why developers notice the difference</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On most chains, a cross-chain app means onboarding the user into a wallet, buying a native
          gas token, and trusting a bridge contract with their funds. On the Internet Computer,
          canisters pay their own cycles — the reverse gas model — so a user can interact with a
          cross-chain app through a standard browser with no wallet installation and no gas.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That combination — web-speed finality, low-cost compute, and native multi-chain signing —
          is what makes Chain Fusion one of the most searched ICP concepts and one of its most
          genuinely distinct capabilities.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Chain Fusion — official docs", href: "https://docs.internetcomputer.org/concepts/chain-fusion/" },
            { label: "Bitcoin integration", href: "https://docs.internetcomputer.org/concepts/chain-fusion/bitcoin/" },
            { label: "Chain-key signatures", href: "https://learn.internetcomputer.org/hc/en-us/articles/34209497587732" },
            { label: "Bitcoin smart contracts — ICP Dashboard", href: "https://dashboard.internetcomputer.org/bitcoin" },
          ].map((l) => (
            <li key={l.href} className="list-disc">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
              What is ICP?
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-cycles-explained" className="underline underline-offset-2 hover:text-foreground">
              ICP cycles explained
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}