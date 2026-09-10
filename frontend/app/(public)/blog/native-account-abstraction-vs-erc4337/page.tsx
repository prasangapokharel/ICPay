import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "native-account-abstraction-vs-erc4337"
const TITLE = "ERC-4337 vs. ICP Native Account Abstraction: Why ICP Never Needed a Wallet Upgrade"
const DESCRIPTION =
  "How native account abstraction on the Internet Computer compares to Ethereum ERC-4337 account abstraction — bundlers, paymasters, and passkey security compared."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 8

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "erc-4337 vs internet computer",
    "account abstraction explained",
    "native account abstraction",
    "smart contract wallets",
    "paymasters and bundlers",
    "internet identity account abstraction",
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
      name: "What is the main difference between ERC-4337 and ICP native account abstraction?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ERC-4337 is an application-layer workaround for Ethereum requiring third-party bundlers, paymaster contracts, and alt-mempools to simulate smart contract wallets. On the Internet Computer, every identity is natively a Principal, every wallet is a smart contract actor, and gasless interactions are built into the protocol.",
      },
    },
    {
      "@type": "Question",
      name: "Why does Ethereum need ERC-4337?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ethereum hardcoded Externally Owned Accounts (EOAs) with fixed ECDSA secp256k1 signature schemes into its base protocol, making native passkey/WebAuthn validation computationally prohibitive without custom contract relays.",
      },
    },
  ],
}

export default function AccountAbstractionComparisonPage() {
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
            Architecture Comparison
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">September 10, 2026</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">8 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          ERC-4337 vs. ICP Native Account Abstraction: Why ICP Never Needed a Wallet Upgrade
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          The Ethereum community spent years trying to solve the poor user experience of seed phrases,
          gas management, and private key losses through <strong className="text-foreground">ERC-4337</strong>.
          Meanwhile, the Internet Computer was architected from day one with native account abstraction.
          Here is a deep technical look at why.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The Ethereum Problem: The EOA Legacy
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In Ethereum, accounts are split into Externally Owned Accounts (EOAs) and Contract Accounts.
          EOAs can initiate transactions but cannot execute logic, recovery rules, or sponsorship without
          complex relays. ERC-4337 introduces an &quot;alt-mempool&quot; with:
        </p>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground leading-relaxed">
          <li className="list-disc"><strong className="text-foreground">UserOperations:</strong> Pseudo-transactions submitted to separate relays.</li>
          <li className="list-disc"><strong className="text-foreground">Bundlers:</strong> Specialized MEV actors who package UserOperations.</li>
          <li className="list-disc"><strong className="text-foreground">Paymasters:</strong> Custom contracts that sponsor gas fees.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. How ICP Solved It at Genesis
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On the Internet Computer, there are no EOAs:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">Native Principals & Passkeys</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every caller is a cryptographic Principal. The protocol natively supports WebAuthn (FIDO2)
              signatures without requiring extra gas-heavy smart contract verifier libraries.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">Reverse Gas Model</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every canister pays its own cycles. There is no need for complex &quot;Paymaster&quot;
              contracts or secondary mempools.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/internet-identity-vs-seed-phrases" className="underline underline-offset-2 hover:text-foreground">
              Internet Identity vs. Seed Phrases: Why Passkeys Are the Future of Crypto Security
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-reverse-gas-model" className="underline underline-offset-2 hover:text-foreground">
              The ICP Reverse Gas Model Explained: Why Users Never Pay Gas
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
