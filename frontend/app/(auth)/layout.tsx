import type { Metadata } from "next"
import { LOGIN_BG } from "@/lib/ui/brand-images"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to ICPay with Internet Identity to send and receive ICP by username. No seed phrase, no password.",
  alternates: { canonical: "/login" },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preload" as="image" href={LOGIN_BG} fetchPriority="high" />
      {children}
    </>
  )
}
