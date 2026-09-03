import { cn } from "@/lib/ui/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading02Icon } from "@hugeicons/core-free-icons"

function Spinner({ className, ...props }: { className?: string } & Omit<React.ComponentProps<"svg">, "strokeWidth">) {
  return (
    <HugeiconsIcon
      data-slot="spinner"
      icon={Loading02Icon}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
