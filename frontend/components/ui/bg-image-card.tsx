import { cn } from "@/lib/ui/utils"

export const PRESALE_CARD_BG = "/images/presale/bg.svg"

export const AMBER_EMBED_BTN =
  "bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950 shadow-md shadow-amber-500/20 hover:from-amber-200 hover:via-yellow-300 hover:to-amber-500 disabled:opacity-50"

export function BgImageCard({
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
      <img
        src={PRESALE_CARD_BG}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-background/75" />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  )
}
