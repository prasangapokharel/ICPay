import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICP Cloud Storage in 2026: Decentralized File Storage on the Internet Computer",
  description:
    "ICP cloud storage explained — on-chain encrypted buckets, global CDN URLs, pay-with-ICP pricing, and how Internet Computer file storage compares to AWS S3, IPFS, and Arweave.",
  alternates: { canonical: "/icp-cloud-storage" },
  openGraph: {
    title: "ICP Cloud Storage in 2026 — ICPay Blog",
    description:
      "A practical guide to decentralized cloud storage on the Internet Computer — encrypted buckets, CDN delivery, and what to use it for.",
    type: "article",
    publishedTime: "2026-08-13T00:00:00Z",
  },
}

export default function IcpCloudStoragePage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Cloud storage</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ICP Cloud Storage in 2026: Decentralized File Storage on the Internet Computer
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most cloud storage runs on a handful of data centres you never see. ICP cloud storage
          is different: files live inside smart contracts on the Internet Computer, encrypted at
          rest, served over a global CDN, and paid for in ICP. Here is how it works and when it
          makes sense.
        </p>
        <p className="text-[11px] text-muted-foreground">August 13, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What is ICP cloud storage?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICP cloud storage is file storage hosted directly on the Internet Computer blockchain.
          Instead of uploading to Amazon S3 or Google Cloud, you store bytes inside a canister — a
          tamper-proof program that holds state on-chain. The canister encrypts files, tracks
          capacity, and serves public objects over HTTP without a traditional server in the middle.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That makes it a form of decentralized cloud storage: no single company owns the
          hardware, and the rules of who can read or write are enforced by code, not by an admin
          panel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How on-chain buckets work</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Products like ICPay Cloud organise storage into <strong className="text-foreground">buckets</strong> — named
          containers with a fixed capacity tier (for example 1 GB, 10 GB, or 25 GB). You pick a
          public or private visibility, pay a 30-day plan from your ICP balance, and upload files
          through the app or an API key.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Encrypted at rest</strong> — each bucket gets its
            own encryption key; raw canister memory is not readable without it.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Chunked uploads</strong> — large files are split
            automatically because the IC limits each update call to 2 MiB of ingress.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">72 file types</strong> — images, documents, code,
            archives, audio, and fonts. Video formats are blocked by design.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">API keys</strong> — automate uploads and deletes
            from CI/CD without keeping an Internet Identity session open.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Public CDN URLs</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Public buckets expose clean CDN links — the bucket name sits in the path and files live
          at the root, so a logo might be served as{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">cloud.icpay.app/my-brand/logo.webp</code>.
          Browsers and curl can fetch these URLs with no wallet or login. Private buckets have no
          public URL; only the owner (or an API key with read permission) can download through
          the canister.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That combination — on-chain storage plus ordinary HTTP delivery — is what people mean
          when they search for an <strong className="text-foreground">ICP CDN</strong> or
          decentralized static asset host.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP cloud storage vs AWS S3</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          AWS S3 is the default for web apps: cheap at scale, mature tooling, and milliseconds of
          latency inside the same region. ICP cloud storage trades some of that maturity for
          properties S3 cannot offer out of the box:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Verifiable custody</strong> — file rules live in
            auditable canister code, not a vendor console.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Pay in ICP</strong> — no credit card or AWS
            account; billing is a native token transfer on the same chain.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Internet Identity login</strong> — no seed phrase
            required for everyday use through a custodial wallet like ICPay.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For a high-traffic global CDN at the lowest dollar cost, S3 plus CloudFront still wins.
          For small-to-medium static assets, brand files, app screenshots, or anything you want
          tied to the Internet Computer ecosystem, ICP cloud storage is the natural fit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP storage vs IPFS and Arweave</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          IPFS and Arweave are the other names people compare when they search for decentralized
          file storage. IPFS is content-addressed and peer-hosted — great for pinning immutable
          blobs, but URLs and availability depend on gateways and pinning services. Arweave
          optimises for permanent, pay-once storage.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Internet Computer file storage is closer to a traditional bucket model: mutable paths,
          monthly capacity plans, private or public visibility, and HTTP GET that behaves like a
          normal CDN. You are not pinning a CID; you are renting encrypted space inside a
          canister you can renew, upgrade, or let expire to read-only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Pricing and plans</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay Cloud prices buckets in ICP for 30-day periods. Capacity tiers run from 1 GB to
          100 GB; the live quote comes from the canister (cycle cost plus margin). Plans stack —
          renewing before expiry adds another 30 days — and expired buckets go read-only until you
          renew. That keeps storage costs predictable for indie developers and small teams who
          already hold ICP in their wallet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Who should use ICP cloud storage?</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">IC app builders</strong> — host logos, manifests,
            and static assets next to the canisters that power your app.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Creators on the Internet Computer</strong> — share
            public WebP or PNG files with a link that does not depend on Imgur or Dropbox.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Automation pipelines</strong> — upload build
            artefacts with an API key from GitHub Actions or similar.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Privacy-sensitive files</strong> — keep documents
            in a private bucket; only your principal or key can read them.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Getting started</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign in at{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            icpay.app
          </Link>{" "}
          with Internet Identity, open <strong className="text-foreground">Settings → Bucket</strong>,
          and create your first bucket. The in-app guide covers TypeScript, Python, and curl
          examples for uploads, CDN GET requests, and API keys.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          New to the chain itself? Read our{" "}
          <Link href="/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            what is ICP guide
          </Link>{" "}
          or our{" "}
          <Link href="/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>{" "}
          comparison to understand how ICPay custody and Internet Identity fit together.
        </p>
      </section>
    </article>
  )
}
