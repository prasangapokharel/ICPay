"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"

type QrCodeProps = {
  value: string
  logo?: string
  className?: string
}

export function QrCode({ value, logo, className }: QrCodeProps) {
  const t = useTranslations("deposit")
  const [done, setDone] = useState<{ value: string; src: string } | null>(null)

  useEffect(() => {
    let active = true
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(value, {
          errorCorrectionLevel: logo ? "H" : "M",
          margin: 2,
          width: 640,
          color: { dark: "#000000", light: "#ffffff" },
        })
      )
      .then((src) => {
        if (active) setDone({ value, src })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [value, logo])

  const loading = done?.value !== value

  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-[min(100%,18rem)] gap-0 py-0 shadow-sm sm:max-w-[min(100%,20rem)]",
        className
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white p-3 ring-1 ring-black/5 sm:p-4">
          {loading ? (
            <Skeleton className="size-full rounded-lg" />
          ) : (
            <>
              <Image
                src={done.src}
                alt={t("qrAlt")}
                width={640}
                height={640}
                unoptimized
                className="size-full object-contain"
              />
              <span className="absolute left-1/2 top-1/2 flex size-[clamp(2rem,22%,3rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-background shadow-sm ring-1 ring-black/10">
                <Image
                  src={logo ?? "/images/logo/logo.png"}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="size-[68%] object-contain"
                />
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
