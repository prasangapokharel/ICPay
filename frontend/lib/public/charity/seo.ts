import type { CharityCampaign } from "@/lib/public/charity/campaigns"
import { pageImageUrl } from "@/lib/public/page-images"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function charityPageUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function charityIndexJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${charityPageUrl("/charity")}#webpage`,
    url: charityPageUrl("/charity"),
    name: "Official disaster relief donations",
    description:
      "ICPay charity pages link to official government disaster relief funds. Donate directly via verified government QR codes.",
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "ICPay",
      url: siteUrl,
    },
  }
}

export function charityCampaignJsonLd(campaign: CharityCampaign) {
  const pageUrl = charityPageUrl(campaign.href)
  const imageUrl = pageImageUrl(campaign.heroImage)

  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: (campaign.faq ?? []).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: campaign.h1,
        description: campaign.description,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "ICPay",
          url: siteUrl,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: imageUrl,
          caption: campaign.heroImageAlt,
        },
        about: {
          "@type": "Event",
          name: "Nepal Flash Flood 2026",
          description: campaign.subtitle,
          location: {
            "@type": "Place",
            name: "Nepal–Tibet border region",
          },
        },
        significantLink: campaign.officialUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Charity",
            item: charityPageUrl("/charity"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: campaign.countryLabel,
            item: charityPageUrl("/charity"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: campaign.title,
            item: pageUrl,
          },
        ],
      },
      faqJsonLd,
    ],
  }
}

export const CHARITY_INDEX_KEYWORDS = [
  "Nepal flash flood donation",
  "disaster relief QR code",
  "Prime Minister Disaster Relief Fund",
  "official charity donation Nepal",
  "NepalPay disaster relief",
  "Fonepay charity donation",
]
