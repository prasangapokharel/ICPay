import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icbucket/hero-section"
import { InstallSection } from "@/components/products/icbucket/install-section"
import { IntegrateSection } from "@/components/products/icbucket/integrate-section"
import { ProblemSolution } from "@/components/products/icbucket/problem-solution"
import { TwitterSection } from "@/components/products/icbucket/twitter-section"
import { FeaturesSection } from "@/components/products/icbucket/features-section"
import { ArchitectureSection } from "@/components/products/icbucket/architecture-section"
import { ComparisonSection } from "@/components/products/icbucket/comparison-section"
import { PricingSection } from "@/components/products/icbucket/pricing-section"
import { ApiGuideSection } from "@/components/products/icbucket/api-guide-section"
import { FaqSection } from "@/components/products/icbucket/faq-section"
import { PAGE_IMAGES, pageImageUrl } from "@/lib/public/page-images"

export const metadata: Metadata = {
  title: "ICBucket - On-Chain Cloud Storage for Web3 | ICPay",
  description:
    "ICBucket is decentralized cloud storage on the Internet Computer. Store files on-chain with API keys and SDKs — 30-day ICP plans from 0.5 ICP, no credit card. Perfect for dApps, NFT metadata, backups, and static hosting.",
  keywords: [
    "ICBucket",
    "on-chain storage",
    "decentralized storage",
    "cloud storage",
    "Internet Computer storage",
    "ICP storage",
    "blockchain storage",
    "Web3 storage",
    "IPFS alternative",
    "S3 alternative",
    "dApp storage",
    "NFT metadata storage",
    "file hosting",
    "static hosting",
    "serverless storage",
    "30-day ICP storage plans",
    "censorship resistant",
    "immutable storage",
    "distributed storage",
  ],
  openGraph: {
    title: "ICBucket - On-Chain Cloud Storage for Web3",
    description:
      "Store files on-chain with API keys and SDKs. 30-day ICP plans — no servers, no AWS bills.",
    url: "https://icpay.app/icbucket",
    siteName: "ICPay",
    images: [
      {
        url: pageImageUrl(PAGE_IMAGES.icbucket.hero),
        width: 1200,
        height: 630,
        alt: "ICBucket - On-Chain Cloud Storage",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICBucket - On-Chain Cloud Storage for Web3",
    description:
      "Store files on-chain with API keys and SDKs. 30-day ICP plans — no servers, no AWS bills.",
    images: [pageImageUrl(PAGE_IMAGES.icbucket.hero)],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icbucket",
  },
}

export default function ICBucketPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <InstallSection />
      <IntegrateSection />
      <ProblemSolution />
      <PricingSection />
      <TwitterSection />
      <FeaturesSection />
      <ArchitectureSection />
      <ComparisonSection />
      <ApiGuideSection />
      <FaqSection />
    </div>
  )
}
