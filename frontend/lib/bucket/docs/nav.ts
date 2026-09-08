import type { BucketDocMeta, BucketDocNavGroup } from "@/lib/bucket/docs/types"

const GROUP_ORDER = [
  "Getting started",
  "Bucket SDK",
  "CDN & URLs",
  "API reference",
] as const

export function buildNavGroups(pages: BucketDocMeta[]): BucketDocNavGroup[] {
  const byGroup = new Map<string, BucketDocMeta[]>()

  for (const page of pages) {
    if (page.slugParts.length === 0) continue
    const list = byGroup.get(page.group) ?? []
    list.push(page)
    byGroup.set(page.group, list)
  }

  return GROUP_ORDER.filter((label) => byGroup.has(label)).map((label) => ({
    label,
    items: (byGroup.get(label) ?? [])
      .sort((a, b) => a.order - b.order)
      .map((page) => ({ slug: page.slug, title: page.title })),
  }))
}

export function docHref(slug: string): string {
  return slug ? `/bucket/docs/${slug}` : "/bucket/docs"
}
