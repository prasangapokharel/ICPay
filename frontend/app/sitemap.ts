import type { MetadataRoute } from "next"
import { BLOG_POSTS } from "@/services/blog/blog"
import { CHARITY_CAMPAIGNS } from "@/lib/public/charity/campaigns"
import { listCachedIndexableChannelSnapshots } from "@/lib/community/publicCache"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"
const staticExport = process.env.ICP_STATIC_EXPORT === "1"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const canisterBlogSlugs = new Set([
    "how-to-create-icp-canister",
    "how-to-top-up-icp-cycles",
    "how-to-manage-icp-canister",
    "how-to-mint-cycles-ledger",
    "how-to-snapshot-icp-canister",
    "what-is-cycles-minting-canister",
    "icp-canister-controllers-explained",
    "canister-out-of-cycles-fix",
    "how-icp-canisters-work",
    "icp-cycles-explained",
    "icp-subnets-explained",
  ])

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority:
      post.slug === "icp-price" ? 0.8 : canisterBlogSlugs.has(post.slug) ? 0.75 : 0.6,
    lastModified: new Date(post.publishedAt),
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

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/roadmap`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/brand-protection`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/token/create`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/canister`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/canister/tools`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/canister/manage`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/canister/create`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/canister/cycles`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/canister/snapshots`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/topup`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/transparency`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...charityEntries,
    { url: `${siteUrl}/channels`, changeFrequency: "weekly", priority: 0.65 },
    ...blogEntries,
    ...channelEntries,
  ]
}
