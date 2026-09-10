import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "how-to-create-icrc1-token-no-code"
const TITLE = "How to Create and Launch an ICRC-1 Token on the Internet Computer (No-Code Guide)"
const DESCRIPTION =
  "Learn how to create, mint, and deploy an ICRC-1 token on the Internet Computer in under 5 minutes without writing code or using dfx — step-by-step with ICPay."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 7

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "create icrc1 token",
    "launch icp token",
    "icrc-1 token standard",
    "how to make a token on internet computer",
    "no code token creator icp",
    "icpay token launchpad",
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
      name: "What is an ICRC-1 token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ICRC-1 is the official, universal fungible token standard on the Internet Computer. It defines standard methods for balance queries, transfers, transaction fees, and metadata across all ICP wallets and decentralized exchanges (DEXes).",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know Rust or Motoko to create an ICRC-1 token?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. With ICPay's Token Creator, you can deploy a full ICRC-1 ledger canister directly from your browser in under 5 minutes by simply specifying token name, symbol, decimals, initial supply, and fee parameters.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to deploy an ICRC-1 token canister?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Deploying a new canister on the Internet Computer requires a creation fee of roughly 0.5 ICP (converted to cycles via the Cycles Minting Canister), which covers canister creation and initial computation fuel.",
      },
    },
  ],
}

export default function CreateIcrc1TokenPage() {
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
            How-To & Guides
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          How to Create and Launch an ICRC-1 Token on the Internet Computer (No-Code Guide)
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Launching a cryptocurrency or utility token on Ethereum or Solana often involves setting up
          complex local developer tooling, auditing Solidity smart contracts, and paying high deployment
          gas fees. On the Internet Computer, you can create and launch a fully compliant{" "}
          <strong className="text-foreground">ICRC-1 / ICRC-2 token</strong> directly from your browser
          in under 5 minutes without writing a single line of code.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Direct Callout Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Ready to deploy now?
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          You can use the official{" "}
          <Link href="/token/create" className="font-bold underline underline-offset-2 text-primary">
            ICPay Token Creator
          </Link>{" "}
          to deploy a production-ready ICRC-1 canister smart contract instantly using Internet Identity.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Understanding the ICRC-1 Standard
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The <strong className="text-foreground">ICRC-1</strong> standard is the official token
          standard on the Internet Computer, similar to ERC-20 on Ethereum or SPL on Solana.
          Key features include:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Subaccount Support:</strong> Users can hold multiple
            isolated balances under a single principal ID.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Predictable Fixed Fees:</strong> Every token defines a
            fixed transfer fee (e.g. 0.0001 tokens) burned or sent to treasury on each transaction.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">ICRC-2 Approval & Allowance:</strong> Enables
            decentralized exchanges (DEXes) like ICPSwap and Sonic to execute swaps seamlessly without
            custody risks.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. Parameters You Need Before Launching
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Field</th>
                <th className="p-3">Example</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Token Name</td>
                <td className="p-3">Sovereign Cloud Coin</td>
                <td className="p-3">The full display name of your token project.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Token Symbol</td>
                <td className="p-3">SOV</td>
                <td className="p-3">3–5 character ticker displayed in wallets and DEXes.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Decimals</td>
                <td className="p-3">8</td>
                <td className="p-3">8 decimals is standard on ICP (similar to 1 e8s).</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Transfer Fee</td>
                <td className="p-3">0.0001 SOV</td>
                <td className="p-3">Fixed fee deducted on each transfer.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Initial Supply</td>
                <td className="p-3">1,000,000 SOV</td>
                <td className="p-3">Total amount minted to your minting account upon creation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Step-by-Step: Deploying with ICPay
        </h2>
        <div className="space-y-3 rounded-lg border border-border p-5 bg-card text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              1
            </span>
            <div>
              <strong className="text-foreground">Sign In With Internet Identity:</strong> Navigate to{" "}
              <Link href="/token/create" className="underline text-primary">/token/create</Link> and authenticate
              using your biometric passkey.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              2
            </span>
            <div>
              <strong className="text-foreground">Enter Token Metadata:</strong> Fill in your token name,
              symbol, decimal precision, transfer fee, and initial supply.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              3
            </span>
            <div>
              <strong className="text-foreground">Fund Canister Creation:</strong> Confirm the ~0.5 ICP
              creation and cycle funding fee. The Cycles Minting Canister (CMC) converts ICP to cycles and
              deploys the ledger canister.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
              4
            </span>
            <div>
              <strong className="text-foreground">Receive Canister ID & Initial Supply:</strong> You will
              instantly receive your unique on-chain Canister ID. Your initial token supply is deposited
              directly into your wallet.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Next Steps: Listing on DEXes & Distribution
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once your ICRC-1 canister is live on-chain:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">DEX Listing:</strong> Create a liquidity pool on ICPSwap
            or Sonic by depositing your token alongside ICP.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Airdrops & Payments:</strong> Transfer tokens to any
            principal or subaccount with sub-second finality and 0.0001 fee.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Canister Monitoring:</strong> Use{" "}
            <Link href="/canister" className="underline text-primary">ICPay Canister Tools</Link> to monitor
            cycles, check balances, and take state snapshots.
          </li>
        </ul>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/icrc-1-token-standard" className="underline underline-offset-2 hover:text-foreground">
              ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icpay-swap-and-live" className="underline underline-offset-2 hover:text-foreground">
              ICPay Swap: Trade ICP and ICRC Tokens on the Internet Computer
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
