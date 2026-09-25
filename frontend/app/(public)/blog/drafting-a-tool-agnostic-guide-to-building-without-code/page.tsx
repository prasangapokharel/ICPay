import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { MediumArticleCard, MediumIcon } from "@/components/blog/medium-article-card"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, Rocket01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

const SLUG = "drafting-a-tool-agnostic-guide-to-building-without-code"
const TITLE = "Drafting a Tool-Agnostic Guide to Building Without Code on the Internet Computer"
const DESCRIPTION =
  "A conceptual, platform-independent blueprint for creating and launching ICRC-1 tokens on the Internet Computer without writing code. Originally published on Medium by @mrcupss.design."
const PUBLISHED_AT = "2026-09-25"
const READING_MINUTES = 5
const MEDIUM_URL =
  "https://medium.com/@mrcupss.design/drafting-a-tool-agnostic-guide-to-building-without-code-4fa01b926619"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "building without code internet computer",
    "tool agnostic guide no code",
    "create icrc-1 token no code",
    "launch icp token without code",
    "mrcupss design medium icpay",
    "no code canister smart contracts",
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
      name: "What makes building no-code on the Internet Computer different?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Internet Computer uses a reverse-gas model where canisters pay for their own computation with cycles. Users never need gas tokens to transact, and authentication happens natively with passkeys via Internet Identity.",
      },
    },
    {
      "@type": "Question",
      name: "Where was this guide originally published?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "This guide was originally written and published on Medium by @mrcupss.design as part of the tool-agnostic building series.",
      },
    },
    {
      "@type": "Question",
      name: "What parameters are mandatory for an ICRC-1 token launch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every ICRC-1 token requires a Token Name, Symbol (ticker), Decimals (usually 8), fixed Transfer Fee, and Initial Supply.",
      },
    },
  ],
}

export default function ToolAgnosticNoCodeGuidePage() {
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

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Architecture & Guides
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <MediumIcon className="size-3 fill-foreground" />
            Medium Featured
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {TITLE}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Launching a cryptocurrency or smart contract on Ethereum or Solana usually means wrestling
          with local developer environments, complex Rust/Solidity audits, and volatile gas fees that
          can eat into your budget before you&apos;ve minted a single coin. The Internet Computer (ICP)
          takes an entirely different approach.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Embedded Medium Hero Card */}
      <MediumArticleCard variant="featured" />

      {/* Overview Intro */}
      <section className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thanks to the <strong className="text-foreground">ICRC-1 standard</strong> and a growing set of
          no-code deployment tools, you can go from idea to a live, on-chain token in a matter of
          minutes — no Motoko, no Rust, and no command line required. Below is the tool-agnostic
          blueprint explaining how the process works, what parameters to prepare, and what to do once
          your canister is live on the global network.
        </p>
      </section>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. What Is ICRC-1, and Why Does It Matter?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICRC-1 is the Internet Computer&apos;s native fungible token standard — the rough equivalent of
          ERC-20 on Ethereum or SPL on Solana. It defines a common interface that wallets, exchanges, and
          dApps can all rely on, so any ICRC-1 token automatically plugs into the existing ICP ecosystem.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A few things make it distinctive:
        </p>
        <ul className="space-y-2.5 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Subaccounts built in:</strong> A single principal (your
            on-chain identity) can hold many isolated balances. This is invaluable for custodial
            services, commerce checkouts, or apps that need to segregate user funds without creating new
            keys.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Fixed, predictable fees:</strong> Every ICRC-1 token
            defines its own flat transfer fee (often a tiny fraction of a token like 0.0001) — so costs are
            known in advance rather than fluctuating with network congestion.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">No gas auctions:</strong> Because the Internet Computer
            uses a reverse-gas model (canisters pay for their own compute via cycles), end users
            generally don&apos;t need to hold a separate &ldquo;gas token&rdquo; just to move your token around.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">ICRC-2 extension for approvals:</strong> Most modern
            token launches pair ICRC-1 with ICRC-2, adding an approve/transfer-from pattern similar to
            ERC-20 allowances. This allows decentralized exchanges like ICPSwap or Sonic to execute
            swaps on your behalf without taking custody of your funds.
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. What You Need Before You Start
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Whichever no-code tool you use, you&apos;ll be asked for the same core parameters. It&apos;s worth
          deciding these in advance rather than improvising mid-flow:
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Field</th>
                <th className="p-3">Example</th>
                <th className="p-3">What It Means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Token Name</td>
                <td className="p-3">Sovereign Cloud Coin</td>
                <td className="p-3">The full display name shown in wallets and explorers.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Token Symbol</td>
                <td className="p-3">SOV</td>
                <td className="p-3">A short ticker, typically 3–5 uppercase characters.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Decimals</td>
                <td className="p-3">8</td>
                <td className="p-3">How finely divisible your token is; 8 is the de facto ICP standard.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Transfer Fee</td>
                <td className="p-3">0.0001 SOV</td>
                <td className="p-3">The fixed amount deducted from every transfer.</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Initial Supply</td>
                <td className="p-3">1,000,000 SOV</td>
                <td className="p-3">Total tokens minted to your account at creation time.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-card p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground">A couple of practical design notes:</p>
          <ul className="space-y-1.5 pl-4">
            <li className="list-disc">
              <strong className="text-foreground">Decimals affect perceived scarcity:</strong> 8 decimals
              mirrors ICP itself and is what most wallets expect, but nothing stops you from choosing
              fewer if that fits your project better.
            </li>
            <li className="list-disc">
              <strong className="text-foreground">Transfer fee isn&apos;t just cosmetic:</strong> It needs to
              be low enough not to annoy users on small transfers, but non-zero fees are what make spam
              and dust-attack transactions economically pointless.
            </li>
            <li className="list-disc">
              <strong className="text-foreground">Initial supply is permanent policy:</strong> Decide up
              front whether your ledger will support future minting or whether this number is the hard
              cap — that&apos;s a governance decision, not a technical afterthought.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. The General No-Code Deployment Flow
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          No-code token creators on the Internet Computer generally follow the same four-step pattern,
          regardless of which specific platform you use:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </span>
              <h3 className="text-sm font-semibold text-foreground">Authenticate with Internet Identity</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ICP&apos;s native authentication uses passkeys and device biometrics instead of 12-word seed
              phrases, so signing in doesn&apos;t require browser extensions or external apps.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </span>
              <h3 className="text-sm font-semibold text-foreground">Enter Your Token&apos;s Metadata</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Name, symbol, decimals, fee, and supply — the fields from the table above — get entered
              directly into an interactive form.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </span>
              <h3 className="text-sm font-semibold text-foreground">Fund Canister Creation</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Deploying a new ledger means spinning up a new canister smart contract, which costs a small
              amount of ICP (~0.5 ICP). That ICP gets converted to cycles via the Cycles Minting
              Canister (CMC) to fuel computation.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                4
              </span>
              <h3 className="text-sm font-semibold text-foreground">Receive Your Canister ID</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is your token&apos;s permanent on-chain address. Your initial supply lands in your
              account immediately, and the token is live — with zero wait for slow block confirmations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. What Happens After Launch
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Minting the token is the easy part. A few operational milestones to plan for next:
        </p>
        <ul className="space-y-2.5 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Get it listed on a DEX:</strong> To make your token
            tradeable, you&apos;ll typically pair it with ICP in an automated market maker (AMM) liquidity pool
            on a decentralized exchange like ICPSwap or Sonic. This gives your token an actual market
            clearing price.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Distribute it seamlessly:</strong> Airdrops, payroll,
            community bounties — ICRC-1 transfers settle in roughly 1 second for sub-cent fees, eliminating
            the painful wait and prohibitive costs typical of Ethereum L1 or congested networks.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Monitor your canister:</strong> Unlike inert EVM contracts,
            an ICP canister requires cycles to pay for memory and CPU execution. Set up cycle threshold
            monitoring using tools like <Link href="/canister" className="text-primary underline">ICPay Canister Tools</Link> so you always know when top-ups are needed.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Consider your upgrade path:</strong> Decide early
            whether your ledger canister will be upgradeable (controlled by a multi-sig or DAO) or
            whether you will renounce controllers to guarantee immutability.
          </li>
        </ul>
      </section>

      {/* Interactive Tool Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Rocket01Icon} className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Launch Your ICRC-1 Token in 5 Minutes</h3>
            <p className="text-xs text-muted-foreground">
              Ready to test this flow? ICPay provides a built-in, no-code token launchpad.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/token/create" />}
            className="rounded-full px-5 text-xs font-semibold"
          >
            Open ICPay Token Creator
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={MEDIUM_URL} target="_blank" rel="noopener noreferrer" />}
            className="gap-1.5 rounded-full px-4 text-xs font-medium"
          >
            <span>Read on Medium</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Medium Support CTA Card */}
      <MediumArticleCard variant="cta" />

      {/* Related Reading */}
      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link
              href="/blog/how-to-create-icrc1-token-no-code"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to Create and Launch an ICRC-1 Token on the Internet Computer (Step-by-Step)
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/icrc-1-token-standard"
              className="underline underline-offset-2 hover:text-foreground"
            >
              ICRC-1 Token Standard Explained: The ERC-20 of the Internet Computer
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-to-manage-icp-canister"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to Manage, Top-Up, and Monitor Canisters on the Internet Computer
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
