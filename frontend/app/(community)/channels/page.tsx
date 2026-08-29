import type { Metadata } from "next"
import { listCachedIndexableChannelSnapshots } from "@/lib/community/publicCache"
import { ChannelsIndexView } from "@/components/community/channels-index-view"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const instant = false

export const metadata: Metadata = {
  title: "ICP Communities — Public Channels on ICPay",
  description:
    "Browse public Internet Computer community channels on ICPay. Join ICP discussions with Internet Identity — no seed phrase required.",
  alternates: { canonical: "/channels" },
  openGraph: {
    title: "ICP Communities on ICPay",
    description:
      "Discover public ICP community channels. Free and paid groups on the Internet Computer.",
    type: "website",
    url: `${siteUrl}/channels`,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ICPay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ICP Communities on ICPay",
    description: "Browse public Internet Computer community channels.",
    images: ["/og.png"],
  },
}

export default async function ChannelsIndexPage() {
  const channels = await listCachedIndexableChannelSnapshots()
  return <ChannelsIndexView channels={channels} />
}
