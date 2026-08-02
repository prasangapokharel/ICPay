import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pay",
  description:
    "Send ICP to an ICPay username. Scan the QR code or copy the address to pay from any Internet Computer wallet.",
}

// Deliberately outside the (app) group: that layout redirects anyone who is not
// signed in, and a payment link has to open for a stranger who has no account.
// No header and no bottom nav either -- this is a link someone shares, not a
// screen inside the wallet.
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm">
        {children}
      </div>
    </div>
  )
}
