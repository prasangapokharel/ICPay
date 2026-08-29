"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon, File01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyText } from "@/lib/wallet/utils"

type BucketDocsCopyMenuProps = {
  markdown: string
}

export function BucketDocsCopyMenu({ markdown }: BucketDocsCopyMenuProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleView = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-3 text-xs" />
        }
      >
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
        Copy page
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopy}>
          <HugeiconsIcon icon={Copy01Icon} className="size-4" />
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleView}>
          <HugeiconsIcon icon={File01Icon} className="size-4" />
          View as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
