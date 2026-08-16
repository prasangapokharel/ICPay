import type { Metadata } from "next"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import { sortedBlogPosts } from "@/services/blog/blog"

export const metadata: Metadata = {
  title: "Blog — Guides, ICP explainers & developer packages",
  description:
    "ICPay blog — Internet Computer guides, wallet tips, cloud storage explainers, and official SDK package links for npm, Python, and Go.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ICPay Blog",
    description: "Guides and explainers for ICP, ICPay, and the Bucket SDK packages.",
    type: "website",
  },
}

export default function BlogIndexPage() {
  const posts = sortedBlogPosts()

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Guides for ICP and ICPay, plus developer resources for our open packages.
        </p>
      </header>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <BlogPostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  )
}
