import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICP Cycles Explained: How Internet Computer Apps Pay for Compute and Storage",
  description:
    "ICP cycles explained — the fuel of the Internet Computer. How cycles are pegged to XDR, what they cost, the reverse gas model, and why developers pay while users don't.",
  alternates: { canonical: "/blog/icp-cycles-explained" },
  openGraph: {
    title: "ICP Cycles Explained — ICPay Blog",
    description:
      "What cycles are, how 1 trillion cycles equals 1 XDR, storage and compute pricing, and why users never pay gas on the Internet Computer.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function IcpCyclesPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">ICP Cycles Explained</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gas is the fee every blockchain user knows. The Internet Computer runs on something
          different: cycles, a unit of computation that is stable, predictable, and paid by the
          developer rather than the user. Here is what cycles are, what they cost, and how the
          economics work.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What cycles are</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A cycle is the Internet Computer&apos;s unit of metered computation. Canisters consume
          cycles for every resource they use — CPU instructions, storage, and network operations.
          Think of cycles as the fuel gauge of a canister: it burns a little on every update call
          and every byte it stores.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Where a traditional cloud bills in US dollars per CPU-hour and a blockchain bills in gas
          denominated in its own volatile token, ICP bills in cycles. That choice matters because of
          how cycles are priced.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The XDR peg</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cycles are pegged to the <strong className="text-foreground">Special Drawing Right (XDR)</strong>{" "}
          — a basket of major currencies maintained by the IMF. The rule is simple:
        </p>
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          1 trillion cycles = 1 XDR (roughly $1.30–$1.40 USD).
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This peg is deliberate. ICP&apos;s token price fluctuates with markets, but the cost of
          running a canister should not swing with the price of ICP. A developer who buys cycles at
          one price can predict what a month of hosting will cost regardless of what the token does.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What running a canister costs</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Costs are published by DFINITY and metered per operation. The numbers give a feel for the
          scale:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">1 GB of storage for a year</strong> — roughly 127
            trillion cycles, about $175–$190 per year at the XDR peg (subnet-dependent; some sources
            quote ~$5/GB/year on storage-only terms — always check the current cost reference).
          </li>
          <li className="list-disc">
            <strong className="text-foreground">1 million compute instructions</strong> — about 4,000
            cycles, a fraction of a cent.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">An HTTPS outcall</strong> — about 49 million cycles
            per call.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">An inter-canister call</strong> — about 260,000
            cycles.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">A threshold ECDSA signature</strong> — about 22
            billion cycles.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Creating a canister</strong> — about 100 billion
            cycles.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Queries — read-only calls — are free. They are served from replicated state without
          consensus and burn no cycles, which is why an app can check a balance on every keystroke
          without cost.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The reverse gas model</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Here is the key difference from most blockchains: <strong className="text-foreground">users
          do not pay gas</strong>. The canister pays for itself out of a prepaid balance of cycles.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A developer buys ICP, converts it to cycles inside the NNS, and tops up their canisters
          the way a founder tops up an AWS account. From the user&apos;s perspective, interacting
          with an ICP app is indistinguishable from a normal website — no gas token, no approval
          popups, no wallet installs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP, cycles, and deflation</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Converting ICP into cycles <strong className="text-foreground">burns the ICP</strong>.
          Every conversion removes tokens from supply. When network usage is high, that burn creates
          deflationary pressure — the opposite of a gas token, which tends to be spent and recycled
          rather than destroyed.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cycles, by contrast, never inflate. They are tied to XDR, so their purchasing power is
          stable by construction. That combination — burning ICP to mint a stable-priced fuel — is
          one of the most distinctive parts of the token&apos;s design.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why cycles matter for businesses</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For products like ICPay Cloud, the economics are what make on-chain storage practical.
          Billing in ICP for a 30-day bucket plan is really a way of pre-paying the canister&apos;s
          cycles. The developer knows the cycle cost of a gigabyte-month, adds a margin, and charges
          users a predictable flat price — while the underlying infrastructure cost stays stable
          because cycles are XDR-pegged.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Cycles — official docs", href: "https://docs.internetcomputer.org/concepts/cycles/" },
            { label: "Cycle costs reference", href: "https://docs.internetcomputer.org/references/cycle-costs/" },
            { label: "Tokens and cycles guide", href: "https://cli.internetcomputer.org/1.1/guides/tokens-and-cycles/" },
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
            <Link href="/blog/icp-reverse-gas-model" className="underline underline-offset-2 hover:text-foreground">
              The reverse gas model explained
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-to-top-up-icp-cycles" className="underline underline-offset-2 hover:text-foreground">
              How to top up ICP cycles
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}