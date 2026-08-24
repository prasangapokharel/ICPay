import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icbucket/hero-section"
import { ProblemSolution } from "@/components/products/icbucket/problem-solution"
import { TwitterSection } from "@/components/products/icbucket/twitter-section"
import { FeaturesSection } from "@/components/products/icbucket/features-section"
import { ArchitectureSection } from "@/components/products/icbucket/architecture-section"
import { ComparisonSection } from "@/components/products/icbucket/comparison-section"
import { PricingSection } from "@/components/products/icbucket/pricing-section"
import { ApiGuideSection } from "@/components/products/icbucket/api-guide-section"
import { FaqSection } from "@/components/products/icbucket/faq-section"
import { ICBUCKET_PACKAGE_LINKS, ProductFooter } from "@/components/products/shared/product-footer"

export const metadata: Metadata = {
  title: "ICBucket - On-Chain Cloud Storage for Web3 | ICPay",
  description:
    "ICBucket is a decentralized cloud storage platform built on Internet Computer. Store files on-chain with S3-compatible API, no servers, no AWS bills. Pay once, store forever. Perfect for dApps, NFT metadata, backups, and static hosting. 1GB-100GB capacity tiers with API keys and programmatic access.",
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
    "pay once storage",
    "no monthly fees",
    "censorship resistant",
    "immutable storage",
    "distributed storage",
  ],
  openGraph: {
    title: "ICBucket - On-Chain Cloud Storage for Web3",
    description:
      "Store files on-chain with S3-compatible API. No servers, no AWS bills. Pay once, store forever on Internet Computer.",
    url: "https://icpay.app/icbucket",
    siteName: "ICPay",
    images: [
      {
        url: "https://icpay.app/images/product/icbuckets/banners/og-image.png",
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
      "Store files on-chain with S3-compatible API. No servers, no AWS bills. Pay once, store forever.",
    images: ["https://icpay.app/images/product/icbuckets/banners/twitter-card.png"],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icbucket",
  },
}

export default function ICBucketPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSolution />
      <TwitterSection />
      <FeaturesSection />
      <ArchitectureSection />
      <ComparisonSection />
      <PricingSection />
      <ApiGuideSection />
      <FaqSection />
      <ProductFooter
        packageLinks={ICBUCKET_PACKAGE_LINKS}
        openSourceDescription="ICBucket SDKs are open source on npm, PyPI, and GitHub."
      />
    </div>
  )
}
