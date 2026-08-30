import type { Metadata } from "next"
import { LandingCta } from "@/components/public/landing-cta"
import { LandingDownloads } from "@/components/public/landing-downloads"
import { LandingFaq } from "@/components/public/landing-faq"
import { LandingFeatures } from "@/components/public/landing-features"
import { LandingHero } from "@/components/public/landing-hero"
import { LandingHowItWorks } from "@/components/public/landing-how-it-works"
import { LandingHowToPay } from "@/components/public/landing-how-to-pay"
import { LandingProducts } from "@/components/public/landing-products"
import { LandingTrust } from "@/components/public/landing-trust"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

export const metadata: Metadata = {
  title: "ICPay — Send ICP by Username",
  description:
    "ICPay is an ICP wallet that lets you send and receive Internet Computer tokens using a username. Sign in with Internet Identity, explore channels, and build with ICBucket and ICFalcon.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ICPay — Send ICP by Username",
    description:
      "Internet Computer wallet, channels, on-chain storage, and developer tooling in one ecosystem.",
    type: "website",
    images: [
      {
        url: LANDING_MEDIA.ogImage,
        width: 1200,
        height: 630,
        alt: "ICPay",
      },
    ],
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingProducts />
      <LandingHowItWorks />
      <LandingHowToPay />
      <LandingTrust />
      <LandingDownloads />
      <LandingFaq />
      <LandingCta />
    </>
  )
}
