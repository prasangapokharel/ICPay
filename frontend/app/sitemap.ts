import type { MetadataRoute } from "next"

// output: "export" cannot defer this to a server, so it is emitted at build time.
export const dynamic = "force-static"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ic-pay.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    // The two pages a stranger actually searches for, so they outrank the
    // legal set: everything below is read after a decision, not before it.
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/roadmap`, changeFrequency: "weekly", priority: 0.6 },
    // A brand looking its own name up arrives here from a search rather than
    // from inside the app, so it ranks above the pages read after signing up.
    { url: `${siteUrl}/brand-protection`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/transparency`, changeFrequency: "monthly", priority: 0.3 },
  ]
}
