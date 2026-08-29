import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICP HTTPS Outcalls Explained: How Canisters Talk to the Outside World",
  description:
    "HTTPS outcalls explained — how Internet Computer canisters make HTTP requests to external APIs, the costs and limits, and why canisters don't need a centralized oracle.",
  alternates: { canonical: "/blog/icp-https-outcalls" },
  openGraph: {
    title: "ICP HTTPS Outcalls Explained — ICPay Blog",
    description:
      "Canisters can fetch real-world data over HTTPS. How ICP outcalls work, what they cost, and what apps can do with them.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function HttpsOutcallsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">ICP HTTPS Outcalls Explained</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A pure smart contract is sealed off from the world — it can only see what is on its own
          chain. The Internet Computer breaks that seal: canisters can make HTTPS requests to any
          public API, directly from on-chain code. This is the feature that lets a canister know the
          price of ICP, check a weather feed, or fetch data without an oracle. Here is how it works.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The oracle problem</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Most blockchains have a hard boundary: smart contracts cannot call external APIs. To bring
          real-world data on-chain, they rely on <strong className="text-foreground">oracles</strong> —
          separate services that fetch data off-chain and push it in. Oracles add a trusted third
          party, a lag, and (historically) an attack surface.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HTTPS outcalls let a canister fetch the data itself. No separate service, no trusted
          intermediary — the canister asks the network to perform an HTTP request on its behalf and
          receives the response as part of its own execution.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How an outcall works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The pattern is simple: your canister code specifies a URL, headers, and method, and calls
          the management canister to perform the request. The HTTP request is executed by the
          subnet&apos;s nodes, and the response is delivered back to your canister deterministically —
          every node that participates gets the same result, so state stays consistent across the
          subnet.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because the request is part of canister execution, the fetched data becomes part of the
          replicated state. If a canister fetches the ICP price and stores it, that price is now
          certified on-chain — available to every other canister and queryable by users.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Costs and limits</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HTTPS outcalls are metered in cycles like everything else on ICP. A single outcall costs on
          the order of tens of millions of cycles — a small fraction of a cent at the XDR peg. The
          practical constraint is the response size: developers declare a{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">max_response_bytes</code> bound, and
          cost scales partly with that declared maximum. Set it as tight as your use case allows, or
          you pay for a ceiling you never use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What canisters can do with them</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Live prices</strong> — a wallet or dashboard canister
            fetches the latest ICP price from an exchange API.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Data relays</strong> — a canister reads real-world data
            and posts it to another chain, replacing a centralized oracle network.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Notifications</strong> — trigger a webhook when
            on-chain conditions change.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Off-chain settlement</strong> — fetch order status or
            verification results from an external service.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The trust trade-off</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HTTPS outcalls remove the oracle as an intermediary, but the external API itself is still a
          source of truth you do not control. If a canister trusts a single price API, that API can
          lie to it. Production patterns mitigate this by querying multiple providers — the same
          consensus-style approach the EVM RPC canister uses for Ethereum, or the exchange-rate
          canister uses for prices.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The key property is that whatever the canister accepts becomes certified on-chain. The
          choice of how many sources to trust is the developer&apos;s, not the network&apos;s.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "HTTPS outcalls — official docs", href: "https://docs.internetcomputer.org/concepts/https-outcalls/" },
            { label: "Using the HTTP interface", href: "https://docs.internetcomputer.org/developer-docs/web-apps/http" },
            { label: "Exchange rate canister", href: "https://docs.internetcomputer.org/exchange-rate-canister" },
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
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/internet-computer-chain-fusion" className="underline underline-offset-2 hover:text-foreground">
              Chain Fusion explained
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}