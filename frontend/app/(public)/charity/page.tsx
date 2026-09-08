import type { Metadata } from "next"
import { CharityCampaignCard } from "@/components/public/charity/charity-campaign-card"
import { CHARITY_CAMPAIGNS } from "@/lib/public/charity/campaigns"
import { CHARITY_IMAGES } from "@/lib/public/charity/images"
import { CHARITY_INDEX_KEYWORDS, charityIndexJsonLd, charityPageUrl } from "@/lib/public/charity/seo"
import { pageImageUrl } from "@/lib/public/page-images"

const title = "Charity — Official Disaster Relief Donations"
const description =
  "ICPay charity pages link to official government disaster relief funds. Donate directly via verified NepalPay, Fonepay, UPI, and eSewa QR codes — we do not collect donations."

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: CHARITY_INDEX_KEYWORDS,
  alternates: { canonical: "/charity" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: charityPageUrl("/charity"),
    siteName: "ICPay",
    type: "website",
    images: [
      {
        url: pageImageUrl(CHARITY_IMAGES.nepalFlashFlood.hero),
        width: 1024,
        height: 683,
        alt: "Nepal flash flood disaster relief",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [pageImageUrl(CHARITY_IMAGES.nepalFlashFlood.hero)],
  },
}

export default function CharityPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(charityIndexJsonLd()) }}
      />
      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Charity
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Official disaster relief donations
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              ICPay publishes verified government QR codes so you can donate directly to official
              disaster relief funds. We never collect, hold, or route your money.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Active campaigns
              </p>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Discover all projects
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              {CHARITY_CAMPAIGNS.length} active relief{" "}
              {CHARITY_CAMPAIGNS.length === 1 ? "campaign" : "campaigns"}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-5">
            {CHARITY_CAMPAIGNS.map((campaign) => (
              <CharityCampaignCard key={campaign.slug} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
