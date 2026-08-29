import type { BucketDocHeading } from "@/lib/bucket/docs/types"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function extractHeadings(markdown: string): BucketDocHeading[] {
  const headings: BucketDocHeading[] = []
  for (const line of markdown.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length as 2 | 3
    const text = match[2].replace(/\{#.+\}$/, "").trim()
    headings.push({ id: slugify(text), text, level })
  }
  return headings
}
