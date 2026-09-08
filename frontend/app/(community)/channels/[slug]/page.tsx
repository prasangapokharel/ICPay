import type { Metadata } from "next"
import {
  channelJsonLd,
  channelMetadata,
  isChannelIndexable,
} from "@/lib/community/seo"
import {
  getCachedPublicChannelSnapshot,
  getCachedPublicChannelAvatar
} from "@/lib/community/publicCache"
import { ChannelSlugView } from "@/components/community/channel-slug-view"
import type { CommunityChannelSnapshot } from "@/lib/community/snapshot"

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
  const channel = await getCachedPublicChannelSnapshot(slug)
  return channelMetadata(slug, channel)
}

export default async function ChannelPublicPage({ params }: PageProps) {
  const { slug } = await params

  // For the placeholder route, return early
  if (slug === "slug") {
    return <ChannelSlugView slug={slug} channel={null} avatarBytes={undefined} />
  }

  // Fetch channel data with timeout handling
  let channel: CommunityChannelSnapshot | null = null
  let avatarBytes: Uint8Array | undefined

  try {
    // Use Promise.race to implement timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 8000) // 8 second timeout
    })

    channel = await Promise.race([
      getCachedPublicChannelSnapshot(slug),
      timeoutPromise
    ])

    // Only fetch avatar if channel loaded successfully
    if (channel) {
      avatarBytes = await Promise.race([
        getCachedPublicChannelAvatar(slug),
        timeoutPromise
      ]).catch(() => undefined) // Avatar is optional, don't fail if it times out
    }
  } catch (error) {
    // Timeout or error - let client-side handle it
    console.error(`Failed to fetch channel ${slug}:`, error)
  }

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
      <ChannelSlugView slug={slug} channel={channel} avatarBytes={avatarBytes} />
    </>
  )
}
