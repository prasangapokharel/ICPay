import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Stake ICP: NNS Neurons, Rewards, and Risks",
  description:
    "How to stake ICP in the Network Nervous System — creating a neuron, choosing a dissolve delay, voting rewards, and the risks of locking up your tokens.",
  alternates: { canonical: "/blog/how-to-stake-icp" },
  openGraph: {
    title: "How to Stake ICP: NNS Neurons, Rewards, and Risks — ICPay Blog",
    description:
      "A step-by-step guide to staking ICP: neurons, dissolve delays from 6 months to 8 years, voting rewards, and what to watch out for.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function HowToStakeIcpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Guide</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">How to Stake ICP</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Staking ICP means locking your tokens in the Network Nervous System (NNS) and earning
          voting rewards for as long as they stay locked. It is one of the three jobs of the ICP token,
          alongside paying for compute and transferring value. Here is how staking works, step by
          step, and the risks to understand before you start.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What staking ICP actually is</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Staking on ICP is not about securing the network in a proof-of-stake sense — consensus on
          ICP is run by node providers, not by stakers. Instead, staked ICP goes into{" "}
          <strong className="text-foreground">neurons</strong>, which participate in governance of the
          Network Nervous System. In exchange for locking your tokens and voting on proposals, you
          earn <strong className="text-foreground">voting rewards</strong> — newly minted ICP paid out
          in proportion to your stake.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The trade-off that decides your rewards</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every neuron has a <strong className="text-foreground">dissolve delay</strong> — how long
          your ICP stays locked. You choose it when you create the neuron, from 6 months up to 8
          years. The longer the delay, the higher the voting weight and the bigger your rewards.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Typical APY in 2026 runs from roughly 15% at a 6-month dissolve delay up to around 28–29% at
          the maximum 8 years. Your ICP remains illiquid for the full dissolve delay — you cannot sell
          or move it until the timer finishes and you dissolve the neuron.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-step</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The NNS is an on-chain DAO with its own dapp. The flow is:
        </p>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            <strong className="text-foreground">Fund a wallet</strong> — hold ICP in an NNS-supported
            wallet. Many wallets, including ICPay, let you hold ICP without touching staking at all.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">Open the NNS dapp</strong> at nns.ic0.app and connect
            your Internet Identity.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">Stake a neuron</strong> — choose how much ICP to lock
            and pick your dissolve delay.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">Vote or delegate</strong> — cast votes on proposals, or
            follow a trusted neuron to auto-vote for you.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">Claim rewards</strong> — voting rewards accrue as you
            vote; you can claim them periodically.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What to watch out for</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Liquidity</strong> — your ICP is locked for the whole
            dissolve delay. An 8-year neuron is a serious commitment.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Rewards are not fixed</strong> — APY depends on the
            neuron&apos;s voting power and participation, so figures are estimates, not promises.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">No slashing</strong> — staking ICP does not come with
            penalty for misbehaviour, but inactivity can still mean missed rewards.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Taxes</strong> — rewards may be taxable income in your
            jurisdiction; check local rules.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Should you stake?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Staking makes sense if you plan to hold ICP long-term and want governance participation plus
          rewards in return for the lock-up. It makes little sense if you need the tokens soon, or if
          you are not interested in voting. A middle path is staking a small amount with a short
          dissolve delay to learn the mechanics, then increasing your position once you are
          comfortable.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Remember that staking is separate from using a wallet: you can hold and send ICP in a wallet
          like ICPay without ever creating a neuron.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "NNS dapp", href: "https://nns.ic0.app/" },
            { label: "Network Nervous System — official docs", href: "https://internetcomputer.org/nns" },
            { label: "Governance on the ICP dashboard", href: "https://dashboard.internetcomputer.org/governance" },
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
            <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
              Best ICP wallet in 2026
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}