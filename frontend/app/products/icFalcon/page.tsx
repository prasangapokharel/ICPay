import type { Metadata } from "next"
import { HeroSection } from "@/components/products/icfalcon/hero-section"
import { ProblemSolution } from "@/components/products/icfalcon/problem-solution"
import { ArticleSection } from "@/components/products/icfalcon/article-section"
import { FaqSection } from "@/components/products/icfalcon/faq-section"
import { CreditSection } from "@/components/products/icfalcon/credit-section"

export const metadata: Metadata = {
  title: "ICFalcon - Production-Ready Motoko Framework for Internet Computer",
  description:
    "ICFalcon is a production-ready Motoko framework for Internet Computer canister development. Build ICP dApps with enforced layered architecture, Next.js frontend, Internet Identity auth, and global falcon CLI. One command to start: npm create icfalcon@latest",
  keywords: [
    "ICFalcon",
    "Motoko framework",
    "Internet Computer framework",
    "ICP framework",
    "Motoko canister development",
    "ICP canister framework",
    "Internet Computer development",
    "dfx framework",
    "Motoko starter",
    "ICP dApp framework",
    "Web3 Motoko framework",
    "Internet Computer Motoko",
    "canister architecture",
    "ICP development tools",
  ],
  openGraph: {
    title: "ICFalcon - Production-Ready Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework for Internet Computer. Layered architecture, Next.js frontend, global CLI. Build and deploy ICP canisters with one command.",
    type: "website",
    images: ["/images/product/icfalcon/icfalcon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ICFalcon - Motoko Framework for Internet Computer",
    description:
      "Production-ready Motoko framework for ICP canister development. Install with one command: npm create icfalcon@latest",
    images: ["/images/product/icfalcon/icfalcon.png"],
  },
  alternates: { canonical: "/products/icFalcon" },
}

export default function ICFalconPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSolution />
      <ArticleSection />
      <FaqSection />
      <CreditSection />
    </div>
  )
}
