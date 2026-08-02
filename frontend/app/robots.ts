import type { MetadataRoute } from "next"

// output: "export" cannot defer this to a server, so it is emitted at build time.
export const dynamic = "force-static"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ic-pay.vercel.app"

// Every route except the login entry point and the public payment links renders
// a signed-in user's wallet, so they are excluded rather than served as thin,
// unreachable pages to crawlers. /u is the export shell behind those links: it
// carries no handle of its own and would index as an empty profile.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
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
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
