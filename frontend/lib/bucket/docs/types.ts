import type { ReactNode } from "react"

export type BucketDocFrontmatter = {
  title: string
  description?: string
  group: string
  order: number
  eyebrow?: string
}

export type BucketDocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export type BucketDocMeta = BucketDocFrontmatter & {
  slug: string
  slugParts: string[]
}

export type BucketDocNavGroup = {
  label: string
  items: { slug: string; title: string }[]
}

export type LoadedBucketDoc = BucketDocMeta & {
  content: ReactNode
  rawBody: string
  fullMarkdown: string
  headings: BucketDocHeading[]
}
