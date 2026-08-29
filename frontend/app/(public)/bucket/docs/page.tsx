import type { Metadata } from "next"
import { BucketDocsView } from "@/components/products/icbucket/bucket-docs-view"

export const metadata: Metadata = {
  title: "ICBucket API Guide | ICPay",
  description:
    "ICBucket documentation — on-chain encrypted storage, public CDN URLs, canister API methods, and SDK examples for Node.js, Python, and curl.",
  alternates: {
    canonical: "https://icpay.app/bucket/docs",
  },
  openGraph: {
    title: "ICBucket API Guide | ICPay",
    description:
      "On-chain file storage API reference, CDN URLs, chunked uploads, and authentication for ICBucket.",
    url: "https://icpay.app/bucket/docs",
    siteName: "ICPay",
    type: "website",
  },
}

export default function BucketDocsPage() {
  return <BucketDocsView />
}
