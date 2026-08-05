"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

// Rendered from a dynamic import so the qrcode library stays out of the initial
// bundle for a page whose first paint is an avatar and a name.
export function PayQr({ value, className }: { value: string; className?: string }) {
  // The address is stored alongside the image rather than in a second state:
  // clearing it on change would be a setState in the effect body, and leaving
  // it would render the previous holder's QR over the new name -- money sent to
  // the wrong account.
  const [done, setDone] = useState<{ value: string; src: string } | null>(null)

  useEffect(() => {
    let active = true
    import("qrcode")
      .then((mod) => mod.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: 512 }))
      .then((src) => {
        if (active) setDone({ value, src })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [value])

  if (done?.value !== value) return <Skeleton className="size-44 rounded-2xl" />

  return (
    // Literal white, not a theme token: the QR is generated as dark modules on a
    // light field, so scanners need that contrast to hold in dark mode too.
    <div className={className}>
      <div className="relative flex items-center justify-center rounded-2xl bg-white p-3">
        <Image
          src={done.src}
          alt=""
          width={512}
          height={512}
          unoptimized
          className="size-44"
        />
        <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-background shadow-sm ring-1 ring-black/10">
          <Image
            src="/images/logo/logo.png"
            alt=""
            width={40}
            height={40}
            className="size-6 object-contain"
          />
        </span>
      </div>
    </div>
  )
}
