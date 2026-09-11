import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "what-is-on-chain"
const TITLE = "What Is On-Chain? The Definitive Guide to Blockchain Data, State & Execution"
const DESCRIPTION =
  "What does 'on-chain' actually mean? We break down on-chain data, execution, storage, and transactions from a builder's perspective — plus on-chain vs. off-chain trade-offs and 2026 AI agent payments."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 11

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "what is on-chain",
    "on-chain vs off-chain",
    "on-chain data",
    "on-chain transactions",
    "on-chain storage",
    "what does on chain mean",
    "blockchain state execution",
    "Internet Computer on-chain",
    "ICPay architecture",
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
      name: "What does on-chain mean in simple terms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In simple terms, 'on-chain' refers to any transaction, piece of data, or computation that occurs directly on a blockchain network, validated by decentralized consensus, cryptographically signed, and permanently recorded in an immutable distributed ledger.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between on-chain and off-chain data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-chain data is directly replicated across every validator node in a blockchain network, making it immutable and verifiable without third parties. Off-chain data is stored in external databases, cloud servers (AWS/GCP), or decentralized storage networks (Filecoin/IPFS) and only referenced or settled on-chain periodically.",
      },
    },
    {
      "@type": "Question",
      name: "Why is storing data on-chain expensive on Ethereum but cheap on ICP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ethereum requires every single validator node to store contract state in global EVM storage with gas fees paid per byte, making 1 GB cost hundreds of thousands of dollars. The Internet Computer uses orthogonal persistence and partitioned subnets with 64-bit stable memory, lowering on-chain storage costs to roughly $5 per gigabyte per year.",
      },
    },
    {
      "@type": "Question",
      name: "Is storing a hash on-chain the same as storing data on-chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Storing a cryptographic hash on-chain only records a fingerprint of the data. If the underlying off-chain file or database record disappears, the hash cannot restore the data. True on-chain storage means the actual file bytes live inside the replicated smart contract state.",
      },
    },
    {
      "@type": "Question",
      name: "How does ICPay operate on-chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ICPay's backend runs directly on-chain as a Motoko canister smart contract (canister ID 6vbhm-nqaaa-aaaan-q6muq-cai). User balances sit in dedicated cryptographic subaccounts on the official ICP ledger, authenticated natively via Internet Identity passkeys.",
      },
    },
  ],
}

export default function WhatIsOnChainPage() {
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

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Architecture & Deep Dive
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          What Is On-Chain? The Definitive Guide to Blockchain Data, State & Execution
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          When we started building ICPay, we encountered crypto&apos;s biggest open secret: most
          so-called &quot;Web3&quot; apps are actually 90% Web2 hosted on AWS. Here is an honest,
          builder-level breakdown of what <strong className="text-foreground">on-chain</strong>{" "}
          really means, what happens when state transitions occur, and how modern architecture
          changes everything in 2026.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Direct Definition Box for Featured Snippet */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Quick Definition: What Does &quot;On-Chain&quot; Mean?
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          <strong>On-chain</strong> refers to any transaction, data record, or computational process
          that occurs directly within a blockchain network, is validated by consensus nodes, is
          cryptographically signed, and is permanently recorded onto a shared, immutable distributed
          ledger.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unlike off-chain processes that rely on centralized databases or local servers, on-chain
          state changes are deterministic, transparent, globally verifiable, and cannot be reversed
          by any single central authority.
        </p>
      </div>

      {/* Section 1: The Builder's Reality */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The Builder&apos;s Reality: Why We Chose True On-Chain Architecture
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If you inspect the network tabs of most popular decentralized applications (dApps) today,
          you will notice something surprising:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            The frontend is served from centralized Amazon CloudFront or Cloudflare CDNs.
          </li>
          <li className="list-disc">
            The user metadata, avatar images, and transaction histories live in a Postgres database on
            AWS RDS.
          </li>
          <li className="list-disc">
            The &quot;on-chain&quot; part is merely an RPC call to a single Infura or Alchemy node to
            trigger an ERC-20 transfer.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If AWS has an outage or the centralized RPC node censors an endpoint, the &quot;decentralized&quot;
          app goes dark.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When we engineered <strong>ICPay</strong>, our mission was to build a custodial ICP wallet
          where money movements, user subaccounts, and payment validation are{" "}
          <strong className="text-foreground">100% on-chain</strong>. The ICPay backend is a Motoko
          canister (smart contract ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">6vbhm-nqaaa-aaaan-q6muq-cai</code>)
          running on the Internet Computer, communicating directly with the official ICP Ledger (canister ID:{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ryjl3-tyaaa-aaaaa-aaaba-cai</code>).
        </p>
      </section>

      {/* Section 2: The Three Pillars of On-Chain */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Three Pillars of &quot;On-Chain&quot;
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To truly understand what on-chain means, we must separate it into three distinct layers:
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4 space-y-2 bg-card">
            <div className="text-primary font-bold text-base">I. On-Chain Data</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every balance, account state, and event log recorded directly into the blockchain&apos;s
              state trie or persistent stable memory, replicated across all consensus nodes.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2 bg-card">
            <div className="text-primary font-bold text-base">II. On-Chain Execution</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Code execution (EVM bytecode, Wasm canisters, Solana BPF) where every step is
              deterministically executed and validated across the network before state changes.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2 bg-card">
            <div className="text-primary font-bold text-base">III. On-Chain Settlement</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cryptographic finality where a transaction cannot be rolled back, re-ordered, or
              altered, secured by mathematical consensus proofs (PoS, PoW, or Threshold BLS).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: On-Chain vs. Off-Chain Side-by-Side */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. On-Chain vs. Off-Chain: The Complete Technical Comparison
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Understanding the trade-offs is crucial for engineers, investors, and everyday crypto
          users. Here is how on-chain and off-chain environments compare in 2026:
        </p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Attribute</th>
                <th className="p-3">On-Chain</th>
                <th className="p-3">Off-Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Validation & Trust</td>
                <td className="p-3">Decentralized consensus; zero trust in third parties needed.</td>
                <td className="p-3">Centralized server, database administrator, or cloud provider.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Immutability</td>
                <td className="p-3">Tamper-proof; past transactions cannot be edited or deleted.</td>
                <td className="p-3">Mutable; database rows can be updated, deleted, or censored.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Execution Model</td>
                <td className="p-3">Deterministic virtual machines (EVM, Wasm, SVM).</td>
                <td className="p-3">Node.js, Python, Go microservices on cloud instances.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Storage Cost</td>
                <td className="p-3">High on legacy chains ($100k+/GB on ETH); ~$5/GB/yr on ICP.</td>
                <td className="p-3">Very low ($0.02/GB/mo on AWS S3).</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Throughput & Latency</td>
                <td className="p-3">1–15s finality depending on chain; metered gas/cycles.</td>
                <td className="p-3">Sub-10ms response times; unmetered local computation.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Failure Mode</td>
                <td className="p-3">Network survives as long as threshold consensus holds.</td>
                <td className="p-3">Single point of failure (server crash, DNS hijack, API ban).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: The 4 Big Gaps Most Blogs Get Wrong */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Four Critical Nuances Most Guides Get Wrong
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Generic blockchain guides often repeat outdated assumptions. Let&apos;s clear up four major
          misconceptions:
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/80 p-4 space-y-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">
              Nuance 1: Storing a Hash on Chain is NOT &quot;On-Chain Data&quot;
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When an NFT or document storage project claims to be &quot;on-chain&quot;, they often
              mean they stored an IPFS CID (hash string) or an HTTPS URL in a smart contract. If the
              underlying IPFS pinning service stops paying or the Amazon bucket deletes the image, the
              on-chain token points to a dead 404 link.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              True on-chain data means the byte array exists in the replicated state itself — like
              canisters with 64-bit stable memory on the Internet Computer or Filecoin&apos;s
              Proof-of-Spacetime (PoSt) storage deals.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 p-4 space-y-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">
              Nuance 2: Finality is Not Binary (Instant vs. Probabilistic vs. Optimistic)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A transaction is not simply &quot;done&quot; the moment you click send:
            </p>
            <ul className="space-y-1.5 pl-4 text-xs text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Bitcoin (Probabilistic):</strong> Requires ~6
                blocks (60 minutes) to reach statistical certainty against deep re-orgs.
              </li>
              <li>
                <strong className="text-foreground">Optimistic Rollups (Arbitrum/Optimism):</strong>{" "}
                State updates are posted immediately off-chain, but final settlement has a 7-day fraud
                proof challenge window.
              </li>
              <li>
                <strong className="text-foreground">Internet Computer (BLS Threshold):</strong>{" "}
                Canisters finalize update calls in ~1–2 seconds with cryptographic threshold
                signatures.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border/80 p-4 space-y-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">
              Nuance 3: Privacy and On-Chain Are Not Mutually Exclusive
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              While public blockchains like Bitcoin and Ethereum broadcast every transfer amount and
              address publicly, modern on-chain ecosystems utilize Zero-Knowledge Proofs (zk-SNARKs)
              and VetKeys (Verifiable Encrypted Threshold Keys) to allow smart contracts to compute on
              encrypted data on-chain without exposing secrets.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 p-4 space-y-2 bg-muted/20">
            <h3 className="text-sm font-semibold text-foreground">
              Nuance 4: 2026 Shift — AI Agents and Autonomous On-Chain Micro-Payments
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In 2026, the primary consumers of on-chain infrastructure are transitioning from humans
              to Autonomous AI Agents. AI agents cannot open a Chase bank account or sign physical
              credit card forms; they require deterministic, programmatic on-chain subaccounts that
              can pay per-token, per-API-query, or per-compute-cycle with zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Case Study: How ICPay Executes On-Chain */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          5. Inside ICPay: How a True On-Chain Custodial Wallet Operates
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To illustrate how modern on-chain architecture works in production, let&apos;s look at the
          exact lifecycle of an ICPay transaction:
        </p>

        <div className="space-y-3 rounded-lg border border-border p-5 bg-card text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              1
            </span>
            <div>
              <strong className="text-foreground">Passkey Authentication (Internet Identity):</strong>{" "}
              The user signs in with biometric hardware keys (FaceID / TouchID / FIDO2). A
              cryptographic public key is derived into an on-chain Principal ID. No seed phrases to
              leak or lose.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              2
            </span>
            <div>
              <strong className="text-foreground">Subaccount Isolation:</strong> The user&apos;s ICP
              sits inside a unique 32-byte cryptographic subaccount on the ICP ledger canister. Only
              calls signed by the authenticated principal can instruct the ICPay backend canister to
              move funds.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              3
            </span>
            <div>
              <strong className="text-foreground">Direct Ledger Inter-Canister Call:</strong> When a
              transfer is submitted (e.g. sending to <code className="bg-muted px-1 py-0.5 rounded font-mono">@alice</code>),
              the ICPay canister initiates an inter-canister update call to the ICP Ledger. The
              balance moves on-chain within 1–2 seconds.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              4
            </span>
            <div>
              <strong className="text-foreground">Reverse Gas Model:</strong> The user does not need
              to hold separate gas tokens to query balances or navigate their wallet. Canisters pay
              for their own compute via prepaid cycles, offering a frictionless Web2-style user
              experience with Web3 security guarantees.
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Verification Checklist */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          6. The 4-Point &quot;Is It Really On-Chain?&quot; Checklist
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Before trusting your capital or mission-critical application to any crypto project, use
          this 4-point verification rubric:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-1.5">
            <div className="text-sm font-semibold text-foreground">1. State Survival Test</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If AWS, Cloudflare, and Infura all went offline simultaneously right now, does the
              application&apos;s state and transaction history still exist across independent nodes?
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-1.5">
            <div className="text-sm font-semibold text-foreground">2. Direct Node Queryability</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Can you read the latest contract state directly from a boundary node or consensus RPC,
              or are you forced to query a proprietary, closed-source backend database?
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1.5 bg-muted/10">
            <div className="text-sm font-semibold text-foreground">3. Upgrade Governance</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Can a single developer change the smart contract bytecode at will with a private key,
              or is it governed by an immutable canister / decentralized DAO (like the NNS)?
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1.5 bg-muted/10">
            <div className="text-sm font-semibold text-foreground">4. Custody Mechanics</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are user funds stored in isolated on-chain cryptographic subaccounts, or pooled in an
              opaque omnibus wallet managed by an off-chain database ledger?
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Frequently Asked Questions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          7. Frequently Asked Questions (FAQs)
        </h2>

        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              What does on-chain mean in simple terms?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In simple terms, &quot;on-chain&quot; means that a piece of information, a financial
              transaction, or a computer program lives and runs directly on a decentralized blockchain
              network. It is verified by multiple independent computers (nodes) rather than a single
              company.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              What is the difference between on-chain and off-chain?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              On-chain operations happen directly on the blockchain ledger, providing maximum security,
              immutability, and transparency at the cost of higher compute fees. Off-chain
              operations happen outside the blockchain (on traditional servers, databases, or Layer-2
              channels) to achieve faster speeds and lower costs, periodically settling their results
              back on-chain.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              Can on-chain transactions be reversed or refunded?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No. Once an on-chain transaction reaches consensus finality, it is cryptographically
              permanent and irreversible. There is no central customer support or bank manager who can
              undo a confirmed on-chain transfer.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              Why is on-chain storage so cheap on the Internet Computer compared to Ethereum?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ethereum forces every validator to hold all smart contract state in a single global EVM
              execution tree, causing state bloat and driving up storage gas costs ($100k+/GB). The
              Internet Computer uses subnet-partitioned WebAssembly memory and stable memory
              architecture, making storage scalable and predictable at roughly $5 per GB per year.
            </p>
          </div>
        </div>
      </section>

      {/* Related Reading & Links */}
      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link
              href="/blog/icp-vs-ethereum"
              className="underline underline-offset-2 hover:text-foreground"
            >
              ICP vs. Ethereum: Complete Architecture & Storage Comparison
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-icp-canisters-work"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How Internet Computer Canisters Work: Wasm, Subnets & Cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/internet-identity-vs-seed-phrases"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Internet Identity vs. Seed Phrases: Passkey Security for Web3
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/gasless-crypto-transactions-icpay"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How the Reverse Gas Model Enables Gasless Crypto Payments
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
