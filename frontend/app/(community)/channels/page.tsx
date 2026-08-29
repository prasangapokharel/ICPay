import type { Metadata } from "next"
import { connection } from "next/server"
import { Suspense } from "react"
import { isChannelIndexable } from "@/lib/community/seo"
import { toCommunityChannelSnapshot } from "@/lib/community/snapshot"
import { listAllPublicChannelsForSeo } from "@/services/community/community"
import { ChannelsIndexView } from "@/components/community/channels-index-view"
import { Spinner } from "@/components/ui/spinner"

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

async function ChannelsIndexLoader() {
  await connection()
  const channels = await listAllPublicChannelsForSeo()
  const open = channels.map(toCommunityChannelSnapshot).filter(isChannelIndexable)
  return <ChannelsIndexView channels={open} />
}

export default function ChannelsIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      }
    >
      <ChannelsIndexLoader />
    </Suspense>
  )
}
