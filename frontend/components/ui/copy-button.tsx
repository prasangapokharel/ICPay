"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/ui/utils"

export function CopyButton({
  value,
  label = "Copy",
  size = "icon-sm",
  variant = "ghost",
  className,
}: {
  value: string
  label?: string
  size?: "icon-sm" | "icon" | "sm"
  variant?: "ghost" | "outline"
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Tooltip open={copied ? true : undefined}>
      <TooltipTrigger>
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={handleCopy}
          className={cn("transition-colors", className)}
          aria-label={label}
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            className={cn(
              "size-4 transition-all",
              copied && "text-success"
            )}
            strokeWidth={2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{copied ? "Copied!" : label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
