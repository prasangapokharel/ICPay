import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"

const SIZES = {
  sm: { outer: "size-14", inner: "size-10", icon: "size-5" },
  md: { outer: "size-18", inner: "size-13", icon: "size-8" },
} as const

export function SuccessTick({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES
  className?: string
}) {
  const dim = SIZES[size]
  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in-75 flex items-center justify-center rounded-full bg-success/10 duration-300 ease-out",
        dim.outer,
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-success text-background shadow-sm",
          dim.inner
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} className={dim.icon} strokeWidth={3} />
      </span>
    </div>
  )
}
