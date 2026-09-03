import type { Metadata } from "next"
import { IcpLiveData } from "@/components/blog/icp-live-data"

export const metadata: Metadata = {
  title: "What is ICP?",
  description:
    "A plain-language guide to the Internet Computer Protocol — how it works, why it exists, and what makes it different from other blockchains.",
  alternates: { canonical: "/blog/what-is-icp" },
  openGraph: {
    title: "What is ICP? — ICPay Blog",
    description:
      "A plain-language guide to the Internet Computer Protocol — live price, market data, and everything you need to know.",
    type: "article",
    publishedTime: "2026-08-09T00:00:00Z",
  },
}

export default function WhatIsIcpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Guide</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">What is ICP?</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Internet Computer Protocol is a blockchain built to run the full web stack —
          smart contracts that serve web pages, store data, and call external APIs, all without
          a centralised cloud provider in the middle.
        </p>
        <p className="text-[11px] text-muted-foreground">August 9, 2026 · 6 min read</p>
      </header>

      {/* Live market data from icrc-api.internetcomputer.org */}
      <IcpLiveData />

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The problem it solves</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Most blockchains hold value — they let you move tokens from one address to another.
          What they cannot do is host the app you use to send those tokens. That app lives on
          Amazon, Google, or Cloudflare, which means there is a centralised point that can be
          taken down, censored, or hacked independent of the chain itself.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Internet Computer changes that model. A canister smart contract on the IC can
          serve an HTTP response directly to a browser — no server needed. The app and its
          data live on-chain, governed by the same consensus rules as the tokens it manages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How it works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The IC is made up of data centres running nodes arranged into{" "}
          <strong className="text-foreground">subnets</strong>. Each subnet runs its own
          Byzantine-fault-tolerant consensus. Canisters — the IC equivalent of smart contracts
          — are deployed to a subnet and can communicate with canisters on other subnets via
          inter-canister calls.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Storage is built in. A canister holds stable memory that persists across upgrades,
          so there is no need to reach out to IPFS or a database. Computation is metered in{" "}
          <strong className="text-foreground">cycles</strong>, a stable unit derived from XDR
          (the IMF&apos;s currency basket), so gas costs do not swing with ICP&apos;s price.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Internet Identity</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Instead of private keys or seed phrases, the IC ships{" "}
          <strong className="text-foreground">Internet Identity</strong> — a passkey-based
          authentication system. You sign in with Face ID, fingerprint, or a hardware key.
          Each app gets a different derived principal so apps cannot track you across sessions,
          and there is nothing to back up.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay uses Internet Identity exclusively. The account you see in the wallet is
          derived from your principal, which is derived from your device credential. No email,
          no password, no seed phrase.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The ICP token</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">ICP is the native token. It has three jobs:</p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Governance.</strong> Staked ICP in the{" "}
            <em>Network Nervous System</em> earns voting rewards and lets holders propose and
            vote on protocol changes.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Cycles.</strong> ICP is burned to mint cycles,
            the fuel for canister computation and storage. Burning removes ICP from supply,
            creating deflationary pressure when usage is high.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Value transfer.</strong> ICP follows the ICRC-1
            token standard, which means any wallet or DEX that supports ICRC-1 can send,
            receive, and trade it — including ICPay.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Chain-key cryptography</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The IC&apos;s most unusual feature is threshold signing. A subnet can collectively
          sign data without any single node holding a complete private key — the key is split
          across all nodes using threshold BLS signatures. This is what makes{" "}
          <strong className="text-foreground">chain-key tokens</strong> like ckBTC and ckETH
          possible: the IC can custody Bitcoin and Ethereum natively, with no bridge contract
          that can be drained.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP and ICPay</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay is an ICP-native custodial wallet. It lives on the IC — the backend is a
          canister, and the frontend is served from an asset canister. Sending ICP means the
          canister calls the ICP ledger directly, in the same consensus round as your request.
          There is no bridge, no wrapped token, and no off-chain relayer.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because the IC charges cycles rather than gas in ICP, and because queries (read-only
          calls) are completely free, ICPay can look up balances and search usernames without
          touching your funds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Internet Computer — official site", href: "https://internetcomputer.org/" },
            { label: "Whitepaper", href: "https://internetcomputer.org/whitepaper.pdf" },
            { label: "Network Nervous System", href: "https://nns.ic0.app/" },
            { label: "DFINITY on GitHub", href: "https://github.com/dfinity" },
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
    </article>
  )
}
