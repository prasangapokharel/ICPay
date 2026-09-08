import { notFound } from "next/navigation"
import { BucketDocsShell } from "@/components/products/icbucket/bucket-docs-shell"
import { buildNavGroups } from "@/lib/bucket/docs/nav"
import { loadAllDocMeta, loadBucketDoc } from "@/lib/bucket/docs/load"

export async function BucketDocsContent({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug = [] } = await params
  const doc = await loadBucketDoc(slug)
  if (!doc) notFound()

  const navGroups = buildNavGroups(loadAllDocMeta())
  return <BucketDocsShell doc={doc} navGroups={navGroups} />
}
