import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "canister-smart-contracts-vs-evm"
const TITLE = "Canister Smart Contracts vs. EVM: Concurrency, Storage & Execution Compared"
const DESCRIPTION =
  "A deep technical breakdown comparing WebAssembly canister smart contracts to the Ethereum Virtual Machine (EVM) — actor model, orthogonal persistence, and gas."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 10

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "canister smart contracts vs evm",
    "wasm blockchain vs evm",
    "actor model smart contracts",
    "orthogonal persistence blockchain",
    "ethereum evm vs icp canisters",
    "internet computer architecture",
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
      name: "How does the actor model in canisters differ from EVM synchronous execution?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EVM executes all contract calls synchronously in a single global thread, creating transaction bottlenecks. Canisters use the Actor Model where each canister is an independent actor with isolated state, processing messages asynchronously and scaling horizontally across subnets.",
      },
    },
    {
      "@type": "Question",
      name: "What is orthogonal persistence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Orthogonal persistence allows a canister to keep in-memory variables and data structures persisted automatically to disk/stable memory without manually writing to a database or storage slot.",
      },
    },
  ],
}

export default function CanisterVsEvmPage() {
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

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Deep Technical Breakdown
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Canister Smart Contracts vs. EVM: Concurrency, Storage & Execution Compared
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          The Ethereum Virtual Machine (EVM) pioneered programmable blockchains in 2015, but it was designed
          around single-threaded sequential execution, expensive storage slots, and synchronous call stacks.
          Canister smart contracts on the Internet Computer use WebAssembly and the Actor Model to scale
          computation horizontally.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Technical Architecture Comparison
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3">Ethereum EVM</th>
                <th className="p-3">ICP Canisters (Wasm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Bytecode Runtime</td>
                <td className="p-3">Custom 256-bit EVM Bytecode</td>
                <td className="p-3">Standard 64-bit WebAssembly (Wasm)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Concurrency Model</td>
                <td className="p-3">Synchronous single-threaded execution</td>
                <td className="p-3">Asynchronous Actor Model with message queues</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Memory Persistence</td>
                <td className="p-3">Key-value 32-byte storage slots (SSTORE)</td>
                <td className="p-3">Orthogonal persistence with 400GB+ stable memory</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Languages</td>
                <td className="p-3">Solidity, Vyper, Yul</td>
                <td className="p-3">Motoko, Rust, TypeScript (Azle), Python (Kybra)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Gas / Billing</td>
                <td className="p-3">User pays gas per transaction in volatile ETH</td>
                <td className="p-3">Reverse gas model: canister burns stable cycles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Actor Model vs. Global Lock
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In Ethereum, if one popular NFT mint or memecoin spikes gas to 200 gwei, every other contract on the
          network becomes unusable due to global contention. In contrast, ICP canisters execute independently
          across subnets, allowing independent applications to run in parallel without competing for block space.
        </p>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer Canisters Work
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-vs-ethereum" className="underline underline-offset-2 hover:text-foreground">
              ICP vs Ethereum: What Is the Difference?
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
