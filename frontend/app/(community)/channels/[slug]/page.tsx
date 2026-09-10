import type { Metadata } from "next"
import {
  channelJsonLd,
  channelMetadata,
  isChannelIndexable,
} from "@/lib/community/seo"
import { getCachedPublicChannelSnapshot } from "@/lib/community/publicCache"
import { listAllPublicChannelsForSeo } from "@/services/community/community"
import { ChannelSlugView } from "@/components/community/channel-slug-view"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"

export async function generateStaticParams() {
  try {
    const channels = await listAllPublicChannelsForSeo(100)
    return [{ slug: "slug" }, ...channels.map((ch) => ({ slug: ch.slug }))]
  } catch {
    return [{ slug: "slug" }]
  }
}

type PageProps = { params: Promise<{ slug: string }> }

async function getChannelWithTimeout(slug: string): Promise<CommunityChannelSnapshot | null> {
  if (!slug || slug === "slug") return null
  try {
    return await Promise.race([
      getCachedPublicChannelSnapshot(slug),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ])
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === "slug") {
    return { title: "ICPay Channels", robots: { index: false, follow: false } }
  }
  const channel = await getChannelWithTimeout(slug)
  return channelMetadata(slug, channel)
}

export default async function ChannelPublicPage({ params }: PageProps) {
  const { slug } = await params

  if (slug === "slug") {
    return <ChannelSlugView slug={slug} channel={null} />
  }

  const channel = await getChannelWithTimeout(slug)
  const jsonLd =
    channel && isChannelIndexable(channel) ? channelJsonLd(slug, channel) : null

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <ChannelSlugView slug={slug} channel={channel} />
    </>
  )
}
