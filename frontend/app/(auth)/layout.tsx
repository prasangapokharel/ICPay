import type { Metadata } from "next"
import { PublicLayout } from "@/components/public/layout"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to ICPay with Internet Identity to send and receive ICP by username. No seed phrase, no password.",
  alternates: { canonical: "/login" },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout variant="content">{children}</PublicLayout>
}
