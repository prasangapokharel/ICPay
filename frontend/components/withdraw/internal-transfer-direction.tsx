import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferVerticalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function DirectionCard({
  fromLabel,
  toLabel,
  fromValue,
  toValue,
  flipLabel,
  onFlip,
}: {
  fromLabel: string
  toLabel: string
  fromValue: string
  toValue: string
  toWallet?: boolean
  flipLabel: string
  onFlip: () => void
}) {
  return (
    <div className="relative rounded-2xl bg-muted/50 p-4">
      <AccountRow label={fromLabel} value={fromValue} />
      <div className="my-2 border-t border-border/60" />
      <AccountRow label={toLabel} value={toValue} />
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={flipLabel}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-background"
        onClick={onFlip}
      >
        <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} className="size-4" strokeWidth={2} />
      </Button>
    </div>
  )
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 pr-12">
      <span className="w-10 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
