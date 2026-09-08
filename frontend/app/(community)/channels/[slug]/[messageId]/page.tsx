import type { Metadata } from "next"
import {
  channelJsonLd,
  channelMetadata,
  isChannelIndexable,
} from "@/lib/community/seo"
import { getCachedPublicChannelSnapshot } from "@/lib/community/publicCache"
import { ChannelSlugView } from "@/components/community/channel-slug-view"

export const instant = false

export function generateStaticParams() {
  return [{ slug: "slug", messageId: "message" }]
}

type PageProps = { params: Promise<{ slug: string; messageId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === "slug") {
    return { title: "ICPay Channels", robots: { index: false, follow: false } }
  }
  const channel = await getCachedPublicChannelSnapshot(slug)
  const base = channelMetadata(slug, channel)
  return {
    ...base,
    robots: { index: false, follow: true },
  }
}

export default async function ChannelMessagePublicPage({ params }: PageProps) {
  const { slug } = await params
  const channel =
    slug === "slug" ? null : await getCachedPublicChannelSnapshot(slug)
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
