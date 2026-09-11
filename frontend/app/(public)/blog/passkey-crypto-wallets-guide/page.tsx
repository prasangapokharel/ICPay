import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "passkey-crypto-wallets-guide"
const TITLE = "The Ultimate Guide to Passkey Crypto Wallets: Biometrics, FIDO2 & Zero Seed Phrases"
const DESCRIPTION =
  "How passkey crypto wallets use WebAuthn, biometric hardware chips, and threshold cryptography to eliminate seed phrase theft while maintaining self-custody."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 8

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "passkey crypto wallet",
    "webauthn crypto wallet",
    "fido2 crypto",
    "seed phrase alternative",
    "biometric crypto security",
    "internet identity passkey",
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
      name: "How does a passkey crypto wallet work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A passkey crypto wallet uses the FIDO2/WebAuthn standard to create asymmetric key pairs secured inside your device's hardware security enclave (like Apple Touch ID or Android Titan M). Signing transactions requires only biometric authorization without exposing private keys.",
      },
    },
    {
      "@type": "Question",
      name: "Can a hacker steal my crypto if they steal my passkey device?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Passkeys require physical biometric authentication (fingerprint or face scan) or device PIN. Furthermore, services like Internet Identity allow you to register multiple recovery devices (such as a YubiKey or secondary phone).",
      },
    },
  ],
}

export default function PasskeyCryptoWalletsGuidePage() {
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
            Security & UX
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          The Ultimate Guide to Passkey Crypto Wallets: Biometrics, FIDO2 & Zero Seed Phrases
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          For over a decade, crypto onboarding has been plagued by a fatal user experience flaw: forcing
          users to write down 12 or 24 random English words on a piece of paper. <strong className="text-foreground">Passkey crypto wallets</strong>{" "}
          replace this fragile mechanism with bank-grade biometric hardware security.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The Failure of the 12-Word Seed Phrase
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Seed phrases suffer from critical systemic vulnerabilities:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Phishing Vulnerability:</strong> Users accidentally type
            their seed phrase into fake Google ads or Discord DMs.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Physical Loss & Disaster:</strong> Paper notes get lost,
            damaged, or stolen.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Single Point of Failure:</strong> Anyone who views the
            phrase gains immediate, irreversible access to all funds.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. How Passkeys Work in Web3
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When you sign in to ICPay using <strong className="text-foreground">Internet Identity</strong>:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">1. Secure Hardware Enclave</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your device generates a unique cryptographic key pair inside its isolated Secure Enclave chip.
              The private key never leaves the physical silicon.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <div className="font-bold text-sm text-primary">2. Scoped Anonymous Principals</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Internet Identity derives a separate cryptographic Principal ID for each app, preventing cross-site
              tracking and surveillance.
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
            <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
              Best ICP Wallet in 2026: Why ICPay Is the Top Internet Computer Wallet
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
