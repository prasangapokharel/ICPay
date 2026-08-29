import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import { extractHeadings } from "@/lib/bucket/docs/headings"
import { bucketMdxComponents } from "@/lib/bucket/docs/mdx-components"
import type { BucketDocFrontmatter, BucketDocMeta, LoadedBucketDoc } from "@/lib/bucket/docs/types"

const DOCS_ROOT = path.join(process.cwd(), "content/bucket/docs")

function listMdxFiles(dir: string, prefix: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return []
  const slugs: string[][] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      slugs.push(...listMdxFiles(path.join(dir, entry.name), [...prefix, entry.name]))
      continue
    }
    if (!entry.name.endsWith(".mdx")) continue
    const name = entry.name.replace(/\.mdx$/, "")
    slugs.push(name === "index" ? prefix : [...prefix, name])
  }

  return slugs
}

function resolveFilePath(slugParts: string[]): string | null {
  if (slugParts.length === 0) {
    const index = path.join(DOCS_ROOT, "index.mdx")
    return fs.existsSync(index) ? index : null
  }
  const file = path.join(DOCS_ROOT, ...slugParts) + ".mdx"
  return fs.existsSync(file) ? file : null
}

function parseFrontmatter(data: Record<string, unknown>): BucketDocFrontmatter {
  return {
    title: String(data.title ?? "Untitled"),
    description: data.description ? String(data.description) : undefined,
    group: String(data.group ?? "Docs"),
    order: Number(data.order ?? 99),
    eyebrow: data.eyebrow ? String(data.eyebrow) : undefined,
  }
}

function toFullMarkdown(frontmatter: BucketDocFrontmatter, body: string): string {
  const lines = ["---"]
  lines.push(`title: "${frontmatter.title.replace(/"/g, '\\"')}"`)
  if (frontmatter.description) {
    lines.push(`description: "${frontmatter.description.replace(/"/g, '\\"')}"`)
  }
  lines.push(`group: "${frontmatter.group}"`)
  lines.push(`order: ${frontmatter.order}`)
  if (frontmatter.eyebrow) lines.push(`eyebrow: "${frontmatter.eyebrow}"`)
  lines.push("---", "", body.trim())
  return lines.join("\n")
}

export function bucketDocSlugs(): string[][] {
  return listMdxFiles(DOCS_ROOT)
}

export function loadAllDocMeta(): BucketDocMeta[] {
  return bucketDocSlugs().map((slugParts) => {
    const filePath = resolveFilePath(slugParts)
    if (!filePath) throw new Error(`Missing doc: ${slugParts.join("/")}`)
    const raw = fs.readFileSync(filePath, "utf8")
    const { data } = matter(raw)
    const frontmatter = parseFrontmatter(data)
    const slug = slugParts.join("/")
    return { ...frontmatter, slug, slugParts }
  })
}

export async function loadBucketDoc(slugParts: string[]): Promise<LoadedBucketDoc | null> {
  const filePath = resolveFilePath(slugParts)
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, "utf8")
  const { data, content: rawBody } = matter(raw)
  const frontmatter = parseFrontmatter(data)
  const slug = slugParts.join("/")

  const { content } = await compileMDX({
    source: rawBody,
    components: bucketMdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  })

  return {
    ...frontmatter,
    slug,
    slugParts,
    content,
    rawBody,
    fullMarkdown: toFullMarkdown(frontmatter, rawBody),
    headings: extractHeadings(rawBody),
  }
}
