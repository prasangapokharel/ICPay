import { cn } from "@/lib/ui/utils"

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
        "inline-flex shrink-0 rounded-full bg-gradient-to-br from-[#FFC229] to-[#13FF91] p-px",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#121215] font-semibold uppercase leading-none tracking-wide text-white",
          size === "sm" ? "h-[15px] px-1.5 text-[8px]" : "h-[19px] px-2 text-[10px]"
        )}
      >
        {children}
      </span>
    </span>
  )
}
