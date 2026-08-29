import Image from "next/image"
import { LANDING_MEDIA } from "@/lib/public/landing-media"

export function LandingHowToPay() {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            How to pay
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Send by username or scan to pay
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Type a @username to send ICP, or open a profile QR code to receive. Same wallet, two
            paths — both settle on the Internet Computer ledger.
          </p>
        </div>

        <div className="overflow-hidden  ">
          <Image
            src={LANDING_MEDIA.paymentFlow}
            alt="ICPay payment flow: send ICP by username on the left, scan QR code to pay on the right"
            width={2240}
            height={1260}
            loading="lazy"
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
