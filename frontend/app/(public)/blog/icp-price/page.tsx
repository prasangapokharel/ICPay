import type { Metadata } from "next"
import Link from "next/link"
import { IcpLiveData } from "@/components/blog/icp-live-data"

export const metadata: Metadata = {
  title: "ICP Price Today: Live Price, Technical Analysis & News",
  description:
    "The live Internet Computer (ICP) price, today's market movement, 7-day technical breakdown, and this week's news — subnet capacity, AI strategy, and Internet Identity.",
  alternates: { canonical: "/blog/icp-price" },
  openGraph: {
    title: "ICP Price Today — ICPay Blog",
    description:
      "Live ICP price, last-7-day chart, market cap, and this week's Internet Computer news in one place — refreshed on every visit.",
    type: "article",
    publishedTime: "2026-08-11T00:00:00Z",
  },
}

export default function IcpPricePage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Market watch</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ICP Price Today: Live Price, Technical Analysis &amp; News
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A snapshot of the Internet Computer token today — the live price chart, what
          moved this week, and the news that matters for ICP holders. The market data below
          updates every time you open the page.
        </p>
        <p className="text-[11px] text-muted-foreground">August 11, 2026 · 5 min read</p>
      </header>

      {/* Live market data from icrc-api.internetcomputer.org */}
      <IcpLiveData />

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The week in one line</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Two things stood out this week. First, DFINITY laid the groundwork for a network
          upgrade that could more than double each subnet&apos;s capacity from 120,000 to
          250,000 canisters — a capacity story, not a speed story. Second, founder Dominic
          Williams pushed hard on the network&apos;s AI narrative, sketching the Intelligence
          Gateway and the Mechanicus agent framework. Neither is a price catalyst by itself,
          but both widen the story of what ICP is for.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Technical analysis, simply put</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The last 7 days trace a clear upward slope off a weak 90-day period. The longer
          trend has been soft — the 90-day change is still deeply negative — so this week&apos;s
          move reads as recovery rather than breakout. If the price holds the most recent
          higher lows, fast money will call it a bullish base; if it fills the gap, it is the
          same range it has traded all quarter.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The honest technical read on ICP this week: momentum is turning positive short-term
          while the medium-term trend remains unconfirmed. Volume direction has followed the
          move, which is the difference between a bounce and a rally.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What&apos;s driving the news</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Subnet capacity to 250,000.</strong> DFINITY is
            submitting NNS proposals in batches to strip custom canister-limit configs before a
            future replica release raises the default limit. Capacity growth, not throughput —
            and the increase only lands if governance approves the later proposal.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">AI strategy defense.</strong> Williams answered
            criticism that on-chain inference is too slow and costly, pointing to the upcoming
            Intelligence Gateway, pay-per-inference in cycles, and verified model outputs.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Internet Identity for AI agents.</strong> Two
            open NNS proposals (143261, 143262) would let AI agents act on your behalf with
            five-minute, revocable permissions — a delegation model built on passkeys, not
            passwords.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Chain Fusion education.</strong> Fresh coverage
            of how canisters sign and move real Bitcoin without a bridge — the ckBTC story that
            keeps pulling people into the ecosystem.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP price prediction: read this first</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Anybody giving you a hard number is guessing. What is worth tracking instead is the
          gap between protocol progress and market attention. This week the network shipped
          real, verifiable upgrades in AI access and capacity while the token remains well off
          its 90-day high. That gap is either an opportunity or a warning — it depends on
          whether the builders can convert progress into demand for ICP itself.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to watch ICP prices</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The chart above is live data from the official ICRC ledger API, refreshed on every visit. Inside
          ICPay the balance is read straight from the ICP ledger on-chain — the same ICRC-1
          ledger the price is booked against, so the balance you see is exactly what the
          network says, plus or minus the transfer fee.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          New to the ecosystem? Start with{" "}
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            what is ICP
          </Link>, then see how to{" "}
          <Link href="/blog/how-to-send-icp" className="underline underline-offset-2 hover:text-foreground">
            send it
          </Link>{" "}
          and where to keep it — our picks for the{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>.
        </p>
      </section>
    </article>
  )
}