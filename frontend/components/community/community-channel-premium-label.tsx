import { cn } from "@/lib/ui/utils"

export function CommunityChannelPremiumLabel({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300",
        className
      )}
    >
      {label}
    </span>
  )
}
