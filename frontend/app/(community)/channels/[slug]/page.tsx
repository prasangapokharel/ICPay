import type { Metadata } from "next"
import {
  channelJsonLd,
  channelMetadata,
  isChannelIndexable,
} from "@/lib/community/seo"
import { getPublicCommunityChannel } from "@/services/community/community"
import { ChannelSlugView } from "@/components/community/channel-slug-view"

export const instant = false

export function generateStaticParams() {
  return [{ slug: "slug" }]
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === "slug") {
    return { title: "ICPay Channels", robots: { index: false, follow: false } }
  }
  const channel = await getPublicCommunityChannel(slug)
  return channelMetadata(slug, channel)
}

export default async function ChannelPublicPage({ params }: PageProps) {
  const { slug } = await params
  const channel = slug === "slug" ? null : await getPublicCommunityChannel(slug)
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
