import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "The ICP Reverse Gas Model Explained: Why Users Never Pay Gas",
  description:
    "The reverse gas model explained — on the Internet Computer, canisters pay for their own compute and storage with cycles, so users interact for free. How it works and why it matters.",
  alternates: { canonical: "/blog/icp-reverse-gas-model" },
  openGraph: {
    title: "The ICP Reverse Gas Model Explained — ICPay Blog",
    description:
      "Why there is no gas for users on the Internet Computer: canisters prepay cycles, developers top up, and apps feel like regular websites.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function ReverseGasModelPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          The ICP Reverse Gas Model Explained
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          On most blockchains, every user pays gas for every transaction. The Internet Computer
          inverts this: the canister — the app itself — pays for its own execution out of a prepaid
          balance of cycles. Users interact for free. Here is how the reverse gas model works and why
          it changes the app experience.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The classic gas problem</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On Ethereum or Solana, a user calling a smart contract pays a transaction fee denominated in
          the network&apos;s token. The fee can spike with congestion, the user needs to hold the gas
          token, and a poorly written frontend can quietly burn a user&apos;s balance in failed
          transactions. For a mainstream consumer, that friction is one of the biggest reasons
          blockchain apps never feel like ordinary websites.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How the reverse gas model works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Internet Computer&apos;s model is closer to a prepaid cloud account than to gas:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            The developer buys ICP and converts it into <strong className="text-foreground">cycles</strong>{" "}
            in the NNS.
          </li>
          <li className="list-disc">
            Cycles are credited to the canister&apos;s balance — 1 trillion cycles = 1 XDR.
          </li>
          <li className="list-disc">
            Every update call, byte of storage, and outcall burns a small amount of that balance.
          </li>
          <li className="list-disc">
            Users call the app without ever paying; the canister covers the cost.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Read-only queries are free on top of that. Because queries skip consensus, they burn no
          cycles at all — so checking a balance, searching a directory, or loading a dashboard costs
          nothing, even for the developer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What it feels like for users</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          From the user&apos;s side there is no gas token to hold, no fee slider, no &quot;approve&quot;
          popup. Sign in with Internet Identity and the app just works — sending ICP, creating a
          bucket, or tipping a profile costs the user nothing extra beyond the amount being moved.
          This is the biggest reason ICP apps can match the onboarding ease of a Web2 product.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What it means for developers</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The trade-off is that the developer carries the cost and must monitor it. A canister&apos;s
          cycle balance is like a utility account — popular apps burn cycles fast, and an empty
          balance freezes the canister. Good operations on ICP mean topping up cycles, watching burn
          rates, and (in products like ICPay Cloud) charging users a product price that covers the
          underlying cycles.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That last point is the revenue model in miniature: an app can charge its users in ICP for
          storage or services while the actual infrastructure cost is paid in stable-priced cycles. The
          margin between what users pay and what cycles cost is the business.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why it is deflationary</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Converting ICP into cycles burns the ICP. Every conversion permanently removes tokens from
          supply, which is deflationary when the network is busy. Meanwhile cycles themselves are
          stable — pegged to XDR — so infrastructure costs do not swing with ICP&apos;s market price.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Cycles — official docs", href: "https://docs.internetcomputer.org/concepts/cycles/" },
            { label: "Cycle costs reference", href: "https://docs.internetcomputer.org/references/cycle-costs/" },
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
            <Link href="/blog/icp-cycles-explained" className="underline underline-offset-2 hover:text-foreground">
              ICP cycles explained
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-to-top-up-icp-cycles" className="underline underline-offset-2 hover:text-foreground">
              How to top up ICP cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-vs-ethereum" className="underline underline-offset-2 hover:text-foreground">
              ICP vs Ethereum
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}