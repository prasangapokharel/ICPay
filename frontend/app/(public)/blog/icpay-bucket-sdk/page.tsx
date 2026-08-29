import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICPay Bucket SDK: npm, Python & Go Clients",
  description:
    "Official icpay-bucket packages for TypeScript, Python, and Go — install links, quick starts, and API docs for ICPay Cloud on the Internet Computer.",
  alternates: { canonical: "/blog/icpay-bucket-sdk" },
  openGraph: {
    title: "ICPay Bucket SDK — ICPay Blog",
    description: "Install the official Bucket clients from npm, PyPI, or Go modules.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

const PACKAGES = [
  {
    name: "npm",
    label: "TypeScript / Node",
    install: "npm install icpay-bucket",
    href: "https://www.npmjs.com/package/icpay-bucket",
    repo: "https://github.com/prasangapokharel/icpay-bucket",
  },
  {
    name: "PyPI",
    label: "Python",
    install: "pip install icpay-bucket",
    href: "https://pypi.org/project/icpay-bucket/",
    repo: "https://github.com/prasangapokharel/icpay-bucket",
  },
  {
    name: "Go",
    label: "Go modules",
    install: "go get github.com/prasangapokharel/icpay-bucket-go",
    href: "https://github.com/prasangapokharel/icpay-bucket-go",
    repo: "https://github.com/prasangapokharel/icpay-bucket-go",
  },
] as const

export default function IcpayBucketSdkPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Developers</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          ICPay Bucket SDK: npm, Python &amp; Go Clients
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay Cloud stores files inside the backend canister on the Internet Computer. These
          three packages talk to the same API — pick the one that fits your stack.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Available packages</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          All clients target canister{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">6vbhm-nqaaa-aaaan-q6muq-cai</code>{" "}
          on mainnet. Version <strong className="text-foreground">1.1.1</strong> covers uploads,
          downloads, chunked files, API keys, and bucket management.
        </p>
        <ul className="space-y-3">
          {PACKAGES.map((pkg) => (
            <li
              key={pkg.name}
              className="space-y-2 rounded-xl border bg-card px-4 py-3.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">{pkg.label}</p>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {pkg.name}
                </span>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed">
                {pkg.install}
              </pre>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a
                  href={pkg.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Registry
                </a>
                <a
                  href={pkg.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Source
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">TypeScript quick start</h2>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
{`import { BucketClient } from "icpay-bucket"

const client = new BucketClient({ apiKey: process.env.BUCKET_API_KEY })
const up = await client.uploadFile({
  bucketId: "my-bucket",
  path: "/hello.txt",
  data: new TextEncoder().encode("hello\\n"),
  contentType: "text/plain",
})
console.log(client.publicUrl("my-bucket", "/hello.txt"))`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What you need first</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            An ICPay account with a bucket — create one under{" "}
            <Link href="/bucket" className="underline underline-offset-2 hover:text-foreground">
              Bucket
            </Link>
            .
          </li>
          <li className="list-disc">
            An API key with the scopes your script needs (read, write, or delete).
          </li>
          <li className="list-disc">
            For browser apps, prefer read-only keys and never embed a delete key in client code.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">More docs</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The in-app reference lists every canister method with curl, TypeScript, and Python
          examples:{" "}
          <Link href="/bucket/docs" className="underline underline-offset-2 hover:text-foreground">
            Bucket API docs
          </Link>
          . For storage concepts, read{" "}
          <Link
            href="/blog/icp-cloud-storage"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ICP cloud storage explained
          </Link>
          , or browse{" "}
          <Link href="/blog" className="underline underline-offset-2 hover:text-foreground">
            all blog posts
          </Link>
          .
        </p>
      </section>
    </article>
  )
}
