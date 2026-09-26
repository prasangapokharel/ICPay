import type { Metadata } from "next"
import {
  LandingAuthRedirect,
  LandingCta,
  LandingDownloads,
  LandingFaq,
  LandingFeatures,
  LandingHero,
  LandingHowItWorks,
  // LandingHowToPay,
  LandingProducts,
  LandingTrust,
  LandingTransparency,
} from "@/components/public/landing"
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
      <LandingAuthRedirect />
      <LandingHero />
      <LandingFeatures />
      <LandingProducts />
      <LandingHowItWorks />
      {/* <LandingHowToPay /> */}
      <LandingTrust />
      <LandingTransparency />
      <LandingDownloads />
      <LandingFaq />
      <LandingCta />
    </>
  )
}
