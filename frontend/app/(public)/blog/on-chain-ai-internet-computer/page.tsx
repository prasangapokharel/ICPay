import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "On-Chain AI on Internet Computer: How AI Models Run Directly Inside Canisters",
  description:
    "On-chain AI crypto on the Internet Computer — ICP AI smart contracts run inside canisters without AWS or centralized APIs. Decentralized AI infrastructure explained.",
  alternates: { canonical: "/blog/on-chain-ai-internet-computer" },
  openGraph: {
    title: "On-Chain AI on Internet Computer — ICPay Blog",
    description: "How ICP hosts native AI models on-chain — no cloud dependency, verified outputs.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function OnChainAiPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          On-Chain AI on Internet Computer: How AI Models Run Directly Inside Canisters
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most &quot;AI crypto&quot; projects call OpenAI from a server and claim decentralization.
          The Internet Computer runs <strong className="text-foreground">AI models inside
          canisters</strong> — on-chain inference, pay-per-call in cycles, and outputs you can
          verify without trusting a cloud provider.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The centralized AI problem</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When your app calls GPT-4 through an API, three risks appear: the provider can change
          pricing overnight, cut access by jurisdiction, or log every prompt. For DeFi bots,
          governance tools, or government services, that dependency is a kill switch — the same
          problem the{" "}
          <Link
            href="/blog/un-sovereign-ai-crypto-infrastructure"
            className="underline underline-offset-2 hover:text-foreground"
          >
            UN sovereign AI pilot
          </Link>{" "}
          is trying to solve.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How on-chain AI works on ICP</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Internet Computer canisters can host Wasm-compiled ML models and run inference directly in
          subnet consensus. The Intelligence Gateway (rolling out via NNS governance) extends this
          with verified model outputs and pay-per-inference billing in cycles — not USD to a cloud
          vendor.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc"><strong className="text-foreground">Model in canister.</strong> Weights stored in stable memory, surviving upgrades.</li>
          <li className="list-disc"><strong className="text-foreground">HTTPS outcalls.</strong> Canisters can fetch external data when needed —{" "}
            <Link href="/blog/icp-https-outcalls" className="underline underline-offset-2 hover:text-foreground">how outcalls work</Link>.
          </li>
          <li className="list-disc"><strong className="text-foreground">Reverse gas.</strong> Developers prepay cycles; end users interact for free.</li>
          <li className="list-disc"><strong className="text-foreground">Tamperproof UI.</strong> Frontend served from a certified asset canister — users verify what code they run.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP AI smart contracts in practice</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          An ICP AI smart contract is a canister that accepts input, runs inference, and returns
          output — all within one consensus round. No off-chain oracle, no AWS Lambda in the
          middle. Use cases emerging on the IC include on-chain chatbots, fraud detection for
          DeFi, content moderation for social apps, and agentic payment routing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why this matters for crypto wallets</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay runs on the same stack — canister backend, asset canister frontend, Internet
          Identity auth. As on-chain AI matures, wallets can offer smart fraud alerts, spending
          insights, and natural-language transfers without sending your data to OpenAI. The{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>{" "}
          of tomorrow is one where AI assists you without leaving the chain.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Can ICP run large language models?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ICP subnets are scaling compute capacity via NNS proposals. Smaller models run today;
              larger models follow as subnet capacity grows. The architecture supports it — the
              bottleneck is hardware, not design.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Is on-chain AI slower than cloud AI?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              For large models, yes — today. The tradeoff is sovereignty: no cloud kill switch, no
              data leaving the subnet, and outputs verifiable on-chain. For many crypto use cases,
              that tradeoff wins.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/can-icp-replace-cloud-computing" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">ICP vs Cloud</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">How Canisters Work</Link>
        </div>
      </section>
    </article>
  )
}
