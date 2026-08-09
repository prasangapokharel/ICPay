export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-icp",
    title: "What is ICP?",
    description:
      "A plain-language guide to the Internet Computer Protocol — how it works, why it exists, and what makes it different from other blockchains.",
    publishedAt: "2026-08-09",
    readingMinutes: 6,
  },
]
