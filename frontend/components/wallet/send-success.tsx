"use client"

import Image from "next/image"
import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatE8s, explorerTxUrl } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

type SendSuccessProps = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  onDone: () => void
}

export function SendSuccess({ amount, recipient, blockIndex, onDone }: SendSuccessProps) {
  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: recipient }).toDataUri(),
    [recipient]
  )

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

      <Button className="mt-8 h-12 w-full text-base" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
