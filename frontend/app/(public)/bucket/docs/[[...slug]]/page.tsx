import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BucketDocsShell } from "@/components/products/icbucket/bucket-docs-shell"
import { buildNavGroups } from "@/lib/bucket/docs/nav"
import { bucketDocSlugs, loadAllDocMeta, loadBucketDoc } from "@/lib/bucket/docs/load"

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export function generateStaticParams() {
  return bucketDocSlugs().map((slugParts) => ({
    slug: slugParts.length > 0 ? slugParts : undefined,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = await loadBucketDoc(slug)
  if (!doc) return { title: "ICBucket Docs | ICPay" }

  const path = slug.length > 0 ? `/bucket/docs/${slug.join("/")}` : "/bucket/docs"
  const title = `${doc.title} | ICBucket Docs | ICPay`

  return {
    title,
    description: doc.description ?? "ICBucket documentation — on-chain encrypted file storage.",
    alternates: { canonical: `https://icpay.app${path}` },
    openGraph: {
      title,
      description: doc.description,
      url: `https://icpay.app${path}`,
      siteName: "ICPay",
      type: "article",
    },
  }
}

export default async function BucketDocsSlugPage({ params }: PageProps) {
  const { slug = [] } = await params
  const doc = await loadBucketDoc(slug)
  if (!doc) notFound()

  const navGroups = buildNavGroups(loadAllDocMeta())

  return <BucketDocsShell doc={doc} navGroups={navGroups} />
}
