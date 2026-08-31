import Image from "next/image"
import { cn } from "@/lib/ui/utils"
import { PAGE_IMAGES } from "@/lib/public/page-images"

const PRESALE_CARD_BG = PAGE_IMAGES.presale.cardBg

/** Presale-only decorative card — do not use on other forms. */
export function PresaleBgCard({
  children,
  className,
  contentClassName,
  minHeight,
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  minHeight?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/40 shadow-lg",
        minHeight,
        className
      )}
    >
      <Image
        src={PRESALE_CARD_BG}
        alt=""
        aria-hidden
        fill
        unoptimized
        className="pointer-events-none object-cover"
      />
      <div className="absolute inset-0 bg-background/75" />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  )
}
