import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icfalcon/hero-section"
import { ProblemSolution } from "@/components/products/icfalcon/problem-solution"
import { ArticleSection } from "@/components/products/icfalcon/article-section"
import { FaqSection } from "@/components/products/icfalcon/faq-section"

export const metadata: Metadata = {
  title: "ICFalcon - Motoko Framework for Internet Computer | ICPay",
  description:
    "ICFalcon is a production-ready Motoko framework for Internet Computer canister development. Build ICP dApps with enforced layered architecture, Next.js frontend, Internet Identity auth, and global falcon CLI. One command to start: npm create icfalcon@latest",
  keywords: [
    "ICFalcon",
    "Motoko framework",
    "Internet Computer framework",
    "ICP development",
    "canister framework",
    "Motoko",
    "ICP dApp",
    "Internet Computer Protocol",
    "Web3 framework",
    "blockchain framework",
    "falcon CLI",
    "ICP scaffold",
    "canister development",
    "DFINITY",
    "Internet Identity",
    "Next.js ICP",
    "full-stack ICP",
  ],
  openGraph: {
    title: "ICFalcon - Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework with layered architecture, Next.js frontend, and global falcon CLI. Start building: npm create icfalcon@latest",
    url: "https://icpay.app/icfalcon",
    siteName: "ICPay",
    images: [
      {
        url: "https://icpay.app/images/product/icfalcon/icfalcon.png",
        width: 1200,
        height: 630,
        alt: "ICFalcon - Motoko Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICFalcon - Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework. Start building: npm create icfalcon@latest",
    images: ["https://icpay.app/images/product/icfalcon/icfalcon.png"],
    creator: "@IcpayOfficial",
  },
  alternates: {
    canonical: "https://icpay.app/icfalcon",
  },
}

export default function ICFalconPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSolution />
      <ArticleSection />
      <FaqSection />
    </div>
  )
}
