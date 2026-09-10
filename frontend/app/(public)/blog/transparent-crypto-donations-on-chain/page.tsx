import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "transparent-crypto-donations-on-chain"
const TITLE = "How On-Chain Donations Eliminate NGO Fraud & Intermediary Fees"
const DESCRIPTION =
  "Why transparent on-chain charity donations on the Internet Computer eliminate traditional 10-20% payment processor cuts and provide 100% public cryptographic audit trails."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 7

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "on-chain charity donations",
    "transparent crypto donations",
    "blockchain for non profits",
    "zero fee charity payments",
    "icpay charity portal",
    "eliminate donation fraud",
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
      name: "How do on-chain donations reduce charitable overhead fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Traditional donation platforms and credit card processors deduct between 5% and 15% in platform, interchange, and cross-border currency conversion fees. On the Internet Computer, transfers incur a flat 0.0001 ICP transaction fee, ensuring virtually 100% of donated capital reaches the cause.",
      },
    },
    {
      "@type": "Question",
      name: "How can donors verify where their funds went?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every donation is deposited directly into a publicly auditable on-chain subaccount on the official ICP ledger, allowing anyone to verify incoming transactions and subsequent distribution via public block explorers.",
      },
    },
  ],
}

export default function TransparentCharityPage() {
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
            Charity & Social Impact
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">September 10, 2026</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">7 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          How On-Chain Donations Eliminate NGO Fraud & Intermediary Fees
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Traditional international charity is burdened by an opaque chain of intermediaries: credit card
          processors taking 3–5%, currency exchange spreads taking another 4–8%, and administrative overhead
          swallowing large portions of donated capital. On-chain charity delivers 100% transparent, auditable
          philanthropy.
        </p>
      </header>

      {/* Direct Callout Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Explore ICPay Verified Campaigns
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          Browse verified community campaigns and make direct, fee-free on-chain contributions at{" "}
          <Link href="/charity" className="font-bold underline text-primary">
            ICPay Charity Portal
          </Link>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The 3 Core Pillars of On-Chain Philanthropy
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">Near-Zero Fees</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fixed 0.0001 ICP network fee regardless of whether you donate $1 or $100,000.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">Public Cryptographic Ledger</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every deposit is verifiable in real time directly on the ICP ledger canister.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">Direct Subaccount Custody</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Campaigns receive funds into isolated smart contract subaccounts without third-party escrow lockups.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/instant-crypto-payments-icpay" className="underline underline-offset-2 hover:text-foreground">
              Instant Crypto Payments with ICPay: Send ICP in Seconds, Not Minutes
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
