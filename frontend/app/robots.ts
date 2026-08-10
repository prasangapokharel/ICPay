import type { MetadataRoute } from "next"

// output: "export" cannot defer this to a server, so it is emitted at build time.
export const dynamic = "force-static"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ic-pay.vercel.app"

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
  // Blog — public and crawlable. The (blog) group has no auth guard, so every
  // post belongs here; add each new route to sitemap.ts as well.
  "/what-is-icp",
  "/best-crypto-wallet",
  "/best-icp-wallet",
  "/what-is-internet-identity",
  "/how-to-send-icp",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: PUBLIC, disallow: PRIVATE },
      // AI crawlers are allowed on purpose. ICPay is open source and its whole
      // pitch is verifiability -- being quotable by an assistant is
      // distribution, not leakage. The private rules still apply to them.
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
