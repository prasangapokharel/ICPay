import type { Metadata } from "next"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "how-to-audit-icp-canister"
const TITLE = "How to Audit an ICP Canister: Security Best Practices & Vulnerability Prevention"
const DESCRIPTION =
  "The comprehensive checklist for auditing Motoko and Rust canisters on the Internet Computer — reentrancy risks, cycle drains, controller security, and icFalcon."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 9

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "how to audit icp canister",
    "icp canister security",
    "motoko smart contract security",
    "rust canister vulnerabilities",
    "cycle drain attack icp",
    "icfalcon canister audit",
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
      name: "What is an inter-canister reentrancy vulnerability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In the Internet Computer's asynchronous messaging model, any `await` keyword yields execution back to the subnet scheduler. If state is not updated before the `await` call or locks are not held, another incoming message can execute concurrently against stale state.",
      },
    },
    {
      "@type": "Question",
      name: "How can developers prevent cycle drain attacks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Developers should implement rate limiting on expensive update calls, ensure ingress messages authenticate the caller, inspect cycle balances, and use automated monitoring tools like icFalcon.",
      },
    },
  ],
}

export default function AuditCanisterPage() {
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
            Developer Security
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          How to Audit an ICP Canister: Security Best Practices & Vulnerability Prevention
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Auditing canisters on the Internet Computer requires a fundamentally different mindset than
          evaluating Solidity EVM smart contracts. Canisters operate asynchronously, persist state across
          stable memory, and pay for their own cycles. Here is the definitive security audit guide.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Direct Callout Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Security Tooling with icFalcon
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          Explore{" "}
          <Link href="/products/icFalcon" className="font-bold underline text-primary">
            icFalcon Developer Security Tools
          </Link>{" "}
          to inspect controller hierarchies, monitor cycle depletion rates, and automate canister health checks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. The 5 Most Common Canister Vulnerabilities
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">1. Inter-Canister Reentrancy Across Awaits</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Whenever an asynchronous inter-canister call is awaited, execution yields. If a user calls a
              withdraw method twice in parallel before the first call finishes, both could pass balance checks.
              Always apply the Checks-Effects-Interactions pattern or reentrancy locks before the `await`.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">2. Unbounded State & Cycle Exhaustion (DoS)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Publicly accessible update functions that append user data to unbounded data structures without
              charging fees or rate-limiting allow malicious actors to flood the canister until its cycle
              balance drops to zero and it freezes.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">3. Traps in Inter-Canister Callbacks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an inter-canister call receives a trap (panic) in a callback, any state changes made prior
              to the call within that method may be reverted, leaving the canister in an inconsistent state.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">4. Insecure Controller Management</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leaving private single-principal controllers on production canisters rather than transferring
              control to an immutable black-hole canister or a decentralized NNS/SNS DAO.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">5. Stable Memory Serialization Failures</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upgrading a canister with incompatible Candid types can cause deserialization failure during
              `post_upgrade`, permanently bricking the canister state.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. The Canister Security Audit Checklist
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Check Area</th>
                <th className="p-3">Requirement</th>
                <th className="p-3">Tool / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              <tr>
                <td className="p-3 font-medium text-foreground">Authentication</td>
                <td className="p-3">Assert caller != Principal.anonymous() on all non-public endpoints.</td>
                <td className="p-3">Caller guard assertion</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Reentrancy</td>
                <td className="p-3">State is mutated before any `await` call.</td>
                <td className="p-3">Manual code audit</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Cycle Reserves</td>
                <td className="p-3">Canister monitors cycle burn rates and alerts before freezing.</td>
                <td className="p-3"><Link href="/canister" className="text-primary underline">ICPay Canister Tools</Link></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Upgrades</td>
                <td className="p-3">Snapshots taken before upgrades; stable memory tested.</td>
                <td className="p-3"><Link href="/canister/snapshots" className="text-primary underline">Snapshot Tool</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/icp-canister-controllers-explained" className="underline underline-offset-2 hover:text-foreground">
              ICP Canister Controllers Explained: Status, Start/Stop & Security
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/canister-out-of-cycles-fix" className="underline underline-offset-2 hover:text-foreground">
              Canister Out of Cycles: What Happens & How to Fix It
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
