import type { Metadata } from "next"
import {
  isCommunityOpen,
  isCommunityPaid,
  ownerHandle,
  type CommunityChannelPublic,
} from "@/services/community/community"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function channelPath(slug: string): string {
  return `/channels/${encodeURIComponent(slug)}`
}

export function channelCanonical(slug: string): string {
  return `${siteUrl}${channelPath(slug)}`
}

export function channelOgImageUrl(slug: string): string {
  return `${siteUrl}/api/community/avatar/${encodeURIComponent(slug)}`
}

export function isChannelIndexable(channel: CommunityChannelPublic): boolean {
  return isCommunityOpen(channel.visibility)
}

export function channelTitle(channel: CommunityChannelPublic): string {
  return `${channel.name} (@${channel.slug}) — ICP Community on ICPay`
}

export function channelDescription(channel: CommunityChannelPublic): string {
  const bio = channel.bio.trim()
  const members = channel.memberCount.toString()
  const owner = ownerHandle(channel)
  const access = isCommunityPaid(channel.access) ? "Paid membership" : "Free to join"
  const lead = bio || `${channel.name} is a public Internet Computer community channel on ICPay.`
  return `${lead} ${members} members · hosted by ${owner}. ${access}. Join with Internet Identity — no seed phrase.`
}

export function channelKeywords(channel: CommunityChannelPublic): string[] {
  const base = [
    channel.name,
    channel.slug,
    "ICP community",
    "Internet Computer channel",
    "ICPay channels",
    "crypto community",
  ]
  const owner = channel.ownerUsername[0]
  if (owner) base.push(owner, `@${owner}`)
  return base
}

export function channelMetadata(
  slug: string,
  channel: CommunityChannelPublic | null
): Metadata {
  if (!channel) {
    return {
      title: "Channel not found",
      robots: { index: false, follow: false },
    }
  }

  const title = channelTitle(channel)
  const description = channelDescription(channel)
  const canonical = channelPath(slug)
  const indexable = isChannelIndexable(channel)
  const ogImage = channelOgImageUrl(slug)

  return {
    title,
    description,
    keywords: channelKeywords(channel),
    alternates: { canonical },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      url: channelCanonical(slug),
      siteName: "ICPay",
      images: [{ url: ogImage, width: 512, height: 512, alt: `${channel.name} on ICPay` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  }
}

export function channelJsonLd(
  slug: string,
  channel: CommunityChannelPublic
): Record<string, unknown> {
  const owner = channel.ownerUsername[0]
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: channel.name,
    description: channelDescription(channel),
    url: channelCanonical(slug),
    image: channelOgImageUrl(slug),
    isPartOf: {
      "@type": "WebSite",
      name: "ICPay",
      url: siteUrl,
    },
    ...(owner
      ? {
          author: {
            "@type": "Person",
            name: owner,
            url: `${siteUrl}/${owner}`,
          },
        }
      : {}),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/JoinAction",
      userInteractionCount: Number(channel.memberCount),
    },
  }
}
