import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/services/blog/blog"
import { CHARITY_CAMPAIGNS } from "@/lib/public/charity/campaigns"
import { fetchIcpswapTokenAll } from "@/services/market/icpswapStats"
import { uniquePairSlugs } from "@/lib/market/tradeSeo"
import { listCachedIndexableChannelSnapshots } from "@/lib/community/publicCache"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"
const staticExport = process.env.ICP_STATIC_EXPORT === "1"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: post.slug === "icp-price" ? 0.8 : 0.6,
  }))

  let channelEntries: MetadataRoute.Sitemap = []
  if (!staticExport) {
    try {
      const channels = await listCachedIndexableChannelSnapshots()
      channelEntries = channels.map((ch) => ({
        url: `${siteUrl}/channels/${encodeURIComponent(ch.slug)}`,
        changeFrequency: "weekly" as const,
        priority: 0.55,
      }))
    } catch {
      channelEntries = []
    }
  }

  const charityEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/charity`, changeFrequency: "weekly", priority: 0.75 },
    ...CHARITY_CAMPAIGNS.map((campaign) => ({
      url: `${siteUrl}${campaign.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: new Date("2026-08-30"),
    })),
  ]

  let marketPairEntries: MetadataRoute.Sitemap = []
  try {
    const listed = await fetchIcpswapTokenAll()
    marketPairEntries = uniquePairSlugs(listed)
      .slice(0, 250)
      .map((pair) => ({
        url: `${siteUrl}/market/trade/${pair}`,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      }))
  } catch {
    marketPairEntries = []
  }

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/roadmap`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/brand-protection`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/token/create`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/transparency`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/market`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/market/trade`, changeFrequency: "hourly", priority: 0.85 },
    ...charityEntries,
    { url: `${siteUrl}/channels`, changeFrequency: "weekly", priority: 0.65 },
    ...blogEntries,
    ...channelEntries,
    ...marketPairEntries,
  ]
}
