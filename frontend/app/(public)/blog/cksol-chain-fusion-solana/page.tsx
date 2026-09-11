import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "cksol-chain-fusion-solana"
const TITLE = "ckSOL Explained: Native Solana Integration on Internet Computer Without Bridges"
const DESCRIPTION =
  "How ckSOL brings native Solana to the Internet Computer using threshold Schnorr signatures and RPC canisters — zero bridge risk and 1-second finality."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 7

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "cksol explained",
    "solana chain fusion icp",
    "internet computer solana integration",
    "ckbtc vs cksol",
    "threshold schnorr signatures",
    "zero bridge solana",
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
      name: "What is ckSOL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ckSOL (Chain-Key Solana) is a 1:1 backed digital twin of SOL living directly on the Internet Computer. It is minted and redeemed entirely by native threshold cryptography canisters without wrapped token bridge contracts.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Internet Computer sign Solana transactions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Internet Computer uses threshold Ed25519 (Schnorr) signatures where a subnet of nodes collectively holds and signs for a Solana address without any single node having access to the private key.",
      },
    },
  ],
}

export default function CkSolPage() {
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
            Chain Fusion
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          ckSOL Explained: Native Solana Integration on Internet Computer Without Bridges
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Following the groundbreaking success of ckBTC and ckETH, <strong className="text-foreground">ckSOL</strong> brings
          native Solana interoperability to the Internet Computer. By leveraging threshold Ed25519 cryptography and direct RPC
          integration, ICP canisters can hold, sign, and settle Solana transactions without centralized custodian bridges.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Why Cross-Chain Bridges Failed
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Over $3.5 billion has been stolen in cross-chain bridge hacks (Wormhole, Nomad, Ronin). Traditional bridges
          rely on multi-sig relayer sets or smart contract vaults on foreign chains that present massive attack vectors.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Chain-Key Cryptography Alternative
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          With Chain Fusion, the Internet Computer subnet functions as a distributed signer:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Threshold Ed25519:</strong> The Solana private key is secret-shared
            across all nodes in the subnet. No single node ever sees the full key.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Direct On-Chain Custody:</strong> When you deposit SOL to a canister-generated
            Solana address, the canister verifies the deposit and mints ckSOL 1:1 on ICP.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Instant Low-Cost Transfers:</strong> Sending ckSOL on ICP takes 1–2 seconds
            with a fixed fee of just 0.0001 ckSOL.
          </li>
        </ul>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/ckbtc-cketh-chain-key-security" className="underline underline-offset-2 hover:text-foreground">
              ckBTC & ckETH Explained: How Chain-Key Tech Eliminates Cross-Chain Bridge Hacks
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/internet-computer-chain-fusion" className="underline underline-offset-2 hover:text-foreground">
              Internet Computer Chain Fusion Explained: How ICP Connects to Bitcoin, Ethereum and Solana
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
