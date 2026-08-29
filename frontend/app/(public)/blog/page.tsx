import type { Metadata } from "next"
import { BlogIndex } from "@/components/blog/blog-index"
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

  return <BlogIndex posts={posts} />
}
