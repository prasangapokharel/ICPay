import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/services/blog/blog"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

// Signed-in wallet routes. They render nothing for an anonymous crawler, so
// indexing them would publish a set of empty pages. /u is the export shell
// behind public payment links: it carries no handle of its own.
const PRIVATE = [
  "/wallet",
  "/deposit",
  "/withdraw",
  "/transfer",
  "/transactions",
  "/profile",
  "/settings",
  "/username",
  "/icpverse",
  "/u",
]

const BLOG_PUBLIC = BLOG_POSTS.map((post) => `/blog/${post.slug}`)

// Public and crawlable. Listed explicitly rather than relying on Allow: / so
// that a new private route added above cannot silently shadow one of them.
const PUBLIC = [
  "/",
  "/about",
  "/faq",
  "/roadmap",
  "/brand-protection",
  "/terms",
  "/privacy",
  "/transparency",
  "/login",
  "/blog",
  ...BLOG_PUBLIC,
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: PUBLIC, disallow: PRIVATE },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "CCBot",
          "meta-externalagent",
          "cohere-ai",
          "Amazonbot",
          "DuckAssistBot",
          "YandexAdditional",
        ],
        allow: PUBLIC,
        disallow: PRIVATE,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
