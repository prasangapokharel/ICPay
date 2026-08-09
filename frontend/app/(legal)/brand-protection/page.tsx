import type { Metadata } from "next"
import { BrandDirectory } from "@/components/legal/brand-directory"
import { RESERVED_BRANDS } from "@/components/legal/reserved-brands"

export const metadata: Metadata = {
  title: "Brand Protection",
  description:
    "ICPay reserves usernames matching real brands so nobody can impersonate them. Search the reserved list, and claim yours with proof of ownership.",
  alternates: { canonical: "/brand-protection" },
}

export default function BrandProtectionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Brand Protection</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A username is how you get paid on ICPay, so a handle matching a real
          brand is worth impersonating. These {RESERVED_BRANDS.length} names are
          held back and cannot be claimed or bought. If one is yours, it is
          waiting for you.
        </p>
      </header>

      <BrandDirectory />
    </div>
  )
}
