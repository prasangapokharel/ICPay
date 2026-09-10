import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "ai-agent-crypto-wallets"
const TITLE = "Agentic Wallets: Why Autonomous AI Agents Need On-Chain Canister Accounts"
const DESCRIPTION =
  "Why AI agents in 2026 cannot use traditional bank accounts or seed phrases — how on-chain canisters and reverse gas enable autonomous agentic commerce."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 9

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ai agent crypto wallet",
    "agentic wallets",
    "ai crypto payments",
    "autonomous ai commerce",
    "model context protocol crypto",
    "internet computer ai agents",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: `${TITLE} — ICPay Blog`,
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: PUBLISHED_AT,
  readingMinutes: READING_MINUTES,
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an agentic crypto wallet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An agentic crypto wallet is an autonomous smart contract account designed to be operated directly by AI agents. It enables AI models to hold funds, pay for API calls and compute, and settle micro-transactions programmatically without requiring human approval on every action.",
      },
    },
    {
      "@type": "Question",
      name: "Why can't AI agents use traditional banking or credit cards?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Traditional banks require physical identity verification (KYC), legal entity registration, and manual fraud verification, which autonomous software agents cannot satisfy. Furthermore, credit cards impose high minimum transaction fees that prevent sub-cent micro-payments.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Internet Computer enable AI agent payments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Internet Computer provides canisters (WebAssembly smart contracts) that can make HTTPS outcalls, hold cryptographic keys, execute deterministic logic, and utilize reverse gas models, allowing AI agents to pay for compute and services natively on-chain.",
      },
    },
  ],
}

export default function AiAgentCryptoWalletsPage() {
  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="space-y-3 border-b border-border/40 pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            AI & Autonomous Systems
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">September 10, 2026</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">9 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Agentic Wallets: Why Autonomous AI Agents Need On-Chain Canister Accounts
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          The future of financial commerce is not just humans clicking &quot;Buy Now&quot; buttons — it is
          autonomous AI agents trading compute, purchasing API tokens, querying real-time data feeds, and
          settling micro-payments in milliseconds. Here is why legacy banking fails AI and how on-chain
          canister architecture provides the foundational rails for agentic commerce.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The AI Agent Problem: The Legacy Financial Dead End
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When an AI agent (such as an LLM reasoning engine or autonomous data crawler) needs to purchase
          compute, it immediately hits three impossible barriers in Web2 finance:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">KYC & Identity Verification:</strong> Stripe and banks
            require human passport scans, Social Security numbers, and physical signatures.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Fee Overhead on Micro-Transactions:</strong> A $0.30 credit
            card interchange fee makes a $0.001 per-query inference payment economically impossible.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Seed Phrase & Key Leakage Risks:</strong> Hardcoding private
            keys in environment variables or prompts leads to catastrophic exploits.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Canister Solution: Sovereign Autonomous Wallets
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On the Internet Computer, smart contracts are WebAssembly actors known as{" "}
          <strong className="text-foreground">canisters</strong>. A canister is not just static code; it is an
          active, autonomous computational entity with its own cryptographic Principal ID:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 space-y-2 bg-card">
            <div className="text-primary font-bold text-sm">Reverse Gas Model</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI agents do not need to hold volatile gas tokens to query state. The canister pays for its own
              execution using prepaid cycles.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2 bg-card">
            <div className="text-primary font-bold text-sm">Direct HTTPS Outcalls</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Canisters can reach out to external REST APIs, verify real-world data across consensus nodes,
              and settle payments without centralized oracle middlemen.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Architecture: How AI Agents Interact with ICPay
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Through standardized programmatic interfaces, AI agents can leverage ICPay subaccount architecture
          for automated budgeting:
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs text-foreground overflow-x-auto space-y-1">
          <div>{"// 1. AI Agent receives bounded budget subaccount"}</div>
          <div>let agentSubaccount = Principal.toSubaccount(agentId);</div>
          <div>{"// 2. Query allowance & balance without paying gas"}</div>
          <div>let balance = await ICPayBackend.getBalance(agentSubaccount);</div>
          <div>{"// 3. Autonomous micro-settlement for API inference"}</div>
          <div>await ICPayBackend.transfer(&#123; to: providerPrincipal, amount: 10_000 /* 0.0001 ICP */ &#125;);</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. The Model Context Protocol (MCP) & Autonomous Web3
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          As standardized protocols like Anthropic&apos;s Model Context Protocol (MCP) become ubiquitous,
          AI coding agents and background workers will integrate wallet tools directly into their execution
          loops. With ICPay, developers can furnish agents with pre-authorized spending caps, isolated
          subaccounts, and instant receipt generation.
        </p>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/on-chain-ai-internet-computer" className="underline underline-offset-2 hover:text-foreground">
              On-Chain AI on Internet Computer: How AI Models Run Directly Inside Canisters
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/what-is-on-chain" className="underline underline-offset-2 hover:text-foreground">
              What Is On-Chain? The Definitive Guide to Blockchain Data, State & Execution
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
