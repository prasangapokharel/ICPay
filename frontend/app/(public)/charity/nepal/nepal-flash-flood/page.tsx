import type { Metadata } from "next"
import { CharityCampaignHero } from "@/components/public/charity/charity-campaign-hero"
import { CharityCrisisStats } from "@/components/public/charity/charity-crisis-stats"
import { CharityDonateSection } from "@/components/public/charity/charity-donate-section"
import { CharityFaqSection } from "@/components/public/charity/charity-faq-section"
import { CharitySceneGallery } from "@/components/public/charity/charity-scene-gallery"
import { CharityStorySection } from "@/components/public/charity/charity-story-section"
import { CharityVideoSection } from "@/components/public/charity/charity-video-section"
import { NEPAL_FLASH_FLOOD_CAMPAIGN } from "@/lib/public/charity/campaigns"
import { charityCampaignJsonLd, charityPageUrl } from "@/lib/public/charity/seo"
import { pageImageUrl } from "@/lib/public/page-images"

const campaign = NEPAL_FLASH_FLOOD_CAMPAIGN

export const metadata: Metadata = {
  title: { absolute: campaign.h1 },
  description: campaign.description,
  keywords: campaign.keywords,
  alternates: { canonical: campaign.href },
  robots: { index: true, follow: true },
  openGraph: {
    title: campaign.h1,
    description: campaign.description,
    url: charityPageUrl(campaign.href),
    siteName: "ICPay",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: pageImageUrl(campaign.heroImage),
        width: 1024,
        height: 683,
        alt: campaign.heroImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: campaign.h1,
    description: campaign.description,
    images: [pageImageUrl(campaign.heroImage)],
  },
}

export default function NepalFlashFloodCharityPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(charityCampaignJsonLd(campaign)) }}
      />
      <CharityCampaignHero campaign={campaign} />
      <CharityCrisisStats campaign={campaign} />
      <CharityDonateSection campaign={campaign} />
      <CharitySceneGallery campaign={campaign} />
      <CharityStorySection campaign={campaign} />
      <CharityFaqSection campaign={campaign} />
      <CharityVideoSection campaign={campaign} />
    </div>
  )
}
