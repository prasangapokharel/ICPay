"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

// The qrcode encoder is only needed once a QR is actually on screen, so it stays
// a dynamic import. Shared by the deposit address card and the payment link card.
export function QrCode({
  value,
  logo,
  className = "size-44",
}: {
  value: string
  logo?: string
  className?: string
}) {
  const t = useTranslations("deposit")
  // The encoded value is stored alongside the image rather than in a second
  // state: clearing it on change would be a setState in the effect body, and
  // leaving it would render the previous address's QR under a new one -- money
  // sent to the wrong account.
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

  if (done?.value !== value) return <Skeleton className="size-52 rounded-2xl" />

  return (
    <div className="relative rounded-2xl border p-3">
      <Image
        src={done.src}
        alt={t("qrAlt")}
        width={512}
        height={512}
        unoptimized
        className={className}
      />
      <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-background shadow-sm ring-1 ring-black/10">
        <Image
          src={logo ?? "/images/logo/logo.png"}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-6 object-contain"
        />
      </span>
    </div>
  )
}
