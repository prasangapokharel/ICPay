import { formatAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

export function BucketPriceLabel({
  priceE8s,
  listPriceE8s,
  perMonth,
  className,
  priceClassName,
}: {
  priceE8s: bigint
  listPriceE8s: bigint
  perMonth?: string
  className?: string
  priceClassName?: string
}) {
  const showDiscount = listPriceE8s > priceE8s

  return (
    <span className={cn("inline-flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5", className)}>
      {showDiscount ? (
        <span className="text-sm text-muted-foreground line-through tabular-nums">
          {formatAmount(listPriceE8s)} ICP
        </span>
      ) : null}
      <span className={cn("font-semibold tabular-nums", priceClassName)}>
        {formatAmount(priceE8s)} ICP
        {perMonth ? (
          <span className="text-xs font-normal text-muted-foreground"> {perMonth}</span>
        ) : null}
      </span>
    </span>
  )
}
