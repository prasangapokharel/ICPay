"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

type BucketCodeBlockProps = {
  code: string
  className?: string
}

export function BucketCodeBlock({ code, className }: BucketCodeBlockProps) {
  const t = useTranslations("bucket")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-muted/30", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        aria-label={t("docsCopyCode")}
        className="absolute top-2 right-2 z-10 size-7 text-muted-foreground hover:bg-background/80"
      >
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
      </Button>
      <pre className="overflow-x-auto p-3 pr-12 font-mono text-[11px] leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  )
}
