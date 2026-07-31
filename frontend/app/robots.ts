import type { MetadataRoute } from "next"

// output: "export" cannot defer this to a server, so it is emitted at build time.
export const dynamic = "force-static"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ic-pay.vercel.app"

// Every route except the login entry point renders a signed-in user's wallet,
// so they are excluded rather than served as thin, unreachable pages to crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/wallet", "/deposit", "/withdraw", "/transfer", "/transactions", "/profile", "/settings"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
