import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "migrate-aws-s3-to-on-chain-icbucket"
const TITLE = "How to Replace AWS S3 with On-Chain Object Storage: Python, Node.js & Go Guide"
const DESCRIPTION =
  "Step-by-step developer tutorial for migrating file storage and media uploads from Amazon AWS S3 to icBucket on the Internet Computer with SDK code examples."
const PUBLISHED_AT = "2026-09-10"
const READING_MINUTES = 8

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "aws s3 alternative web3",
    "icbucket migration guide",
    "decentralized object storage python",
    "nodejs on-chain file upload",
    "icp storage sdk",
    "replace amazon s3 with blockchain",
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
      name: "Why should developers migrate from AWS S3 to icBucket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "icBucket provides tamper-proof, censorship-resistant on-chain object storage with predictable cycle-based pricing, zero vendor lock-in, and direct browser HTTP delivery without egress bandwidth surcharges.",
      },
    },
    {
      "@type": "Question",
      name: "What SDKs are available for icBucket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ICPay provides official, production-ready SDKs for Node.js/TypeScript (npm), Python (PyPI), and Go.",
      },
    },
  ],
}

export default function MigrateS3ToIcBucketPage() {
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
            Developer Tutorials
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">September 10, 2026</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">8 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          How to Replace AWS S3 with On-Chain Object Storage: Python, Node.js & Go Guide
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Centralized cloud storage like Amazon AWS S3 carries hidden egress bandwidth taxes, account suspension
          risks, and centralized failure points. With <strong className="text-foreground">icBucket</strong> on the
          Internet Computer, you can store files directly on-chain with native SDKs in TypeScript, Python, and Go.
        </p>
      </header>

      {/* Direct Callout Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Explore icBucket Cloud Storage
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          View live pricing at{" "}
          <Link href="/bucket/pricing" className="font-bold underline text-primary">
            icBucket Pricing & Tiers
          </Link>{" "}
          and manage your storage canisters at{" "}
          <Link href="/icbucket" className="font-bold underline text-primary">
            icBucket Console
          </Link>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Quickstart: Node.js / TypeScript SDK
        </h2>
        <div className="rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs text-foreground overflow-x-auto space-y-2">
          <div>npm install @icpay/bucket</div>
          <div className="text-muted-foreground">{"// Upload a file to your on-chain bucket"}</div>
          <div>import &#123; IcBucketClient &#125; from &quot;@icpay/bucket&quot;;</div>
          <div>const client = new IcBucketClient(&#123; canisterId: &quot;YOUR_CANISTER_ID&quot; &#125;);</div>
          <div>const result = await client.uploadFile(&quot;document.pdf&quot;, fileBuffer);</div>
          <div>console.log(&quot;File live at:&quot;, result.url);</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. Python SDK Integration
        </h2>
        <div className="rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs text-foreground overflow-x-auto space-y-2">
          <div>pip install icpay-bucket</div>
          <div className="text-muted-foreground"># Uploading with Python</div>
          <div>from icpay_bucket import BucketClient</div>
          <div>client = BucketClient(canister_id=&quot;YOUR_CANISTER_ID&quot;)</div>
          <div>file_url = client.upload(&quot;dataset.parquet&quot;)</div>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/40 pt-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Related Reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/icpay-bucket-sdk" className="underline underline-offset-2 hover:text-foreground">
              ICPay Bucket SDK: npm, Python & Go Clients
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/decentralized-storage-comparison-ipfs-filecoin-icp" className="underline underline-offset-2 hover:text-foreground">
              Decentralized Storage Compared: IPFS vs. Arweave vs. Filecoin vs. icBucket
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
