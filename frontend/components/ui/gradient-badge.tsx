import { cn } from "@/lib/ui/utils"

const BADGE_SRC = "/images/svg/badge/1.svg"

export function GradientBadge({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        size === "sm" ? "h-4 px-2" : "h-5 px-2.5",
        className
      )}
    >
      <img
        src={BADGE_SRC}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-fill"
      />
      <span
        className={cn(
          "relative z-10 font-semibold uppercase leading-none tracking-wide text-foreground",
          size === "sm" ? "text-[8px]" : "text-[10px]"
        )}
      >
        {children}
      </span>
    </span>
  )
}
