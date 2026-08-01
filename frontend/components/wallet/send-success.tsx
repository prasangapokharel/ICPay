"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, Share08Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatE8s, explorerTxUrl } from "@/lib/wallet-utils"
import { shareReceipt } from "@/lib/receipt"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type SendSuccessProps = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
  onDone: () => void
}

export function SendSuccess({ amount, recipient, blockIndex, memo, onDone }: SendSuccessProps) {
  const [sharing, setSharing] = useState(false)

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: recipient }).toDataUri(),
    [recipient]
  )

  const handleShare = async () => {
    setSharing(true)
    try {
      const outcome = await shareReceipt({ amount, recipient, blockIndex, memo })
      if (outcome === "downloaded") {
        toast.add({ title: "Receipt saved", description: "Check your downloads." })
      }
    } catch {
      toast.add({ title: "Could not create receipt", description: "Please try again." })
    } finally {
      setSharing(false)
    }
  }

  const label = recipient.startsWith("@")
    ? recipient
    : recipient.length > 16
      ? `${recipient.slice(0, 6)}…${recipient.slice(-4)}`
      : recipient

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-muted/50 ring-8 ring-muted/20">
        <Image src="/images/logo/logo.png" alt="" width={56} height={56} className="size-14" />
      </span>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">Send Success</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;ve sent {label} some ICP!
      </p>

      <p className="mt-8 text-xs text-muted-foreground">Total</p>
      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
        {formatE8s(amount)} ICP
      </p>

      <div className="mt-8 w-full border-t border-dashed pt-6 text-left">
        <p className="text-xs text-muted-foreground">Recipient</p>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
          <Avatar className="size-11 shrink-0">
            <AvatarImage src={avatarUri} alt="" />
            <AvatarFallback className="text-xs">
              {recipient.replace(/^@/, "").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", !recipient.startsWith("@") && "font-mono text-xs")}>
              {label}
            </p>
            <a
              href={explorerTxUrl(blockIndex)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
            >
              View on ICP Dashboard
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 grid w-full gap-2.5">
        <Button
          variant="outline"
          className="h-12 w-full text-base"
          onClick={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <Spinner className="size-4" />
          ) : (
            <HugeiconsIcon icon={Share08Icon} className="size-4" />
          )}
          {sharing ? "Preparing…" : "Share receipt"}
        </Button>
        <Button className="h-12 w-full text-base" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}
