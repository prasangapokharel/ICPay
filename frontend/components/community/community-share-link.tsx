"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/ui/utils"

export function CommunityCopyLinkButton({
  onCopy,
  label,
  className,
}: {
  onCopy: () => Promise<void>
  label: string
  className?: string
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("h-11 w-full justify-center gap-2 rounded-xl bg-muted/40", className)}
      onClick={() => void handle()}
    >
      <AppIcon name={copied ? "check" : "chatCopy"} size={18} mono />
      {copied ? tc("copied") : label}
    </Button>
  )
}

export function CommunityShareLinkButton({
  onCopy,
  className,
}: {
  onCopy: () => Promise<void>
  className?: string
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("h-11 w-full justify-center gap-2 rounded-xl bg-muted/40", className)}
      onClick={() => void handle()}
    >
      <AppIcon name={copied ? "check" : "chatShare"} size={18} mono />
      {copied ? tc("copied") : tc("share")}
    </Button>
  )
}

export function CommunityCopyMenuItem({
  onCopy,
  label,
}: {
  onCopy: () => Promise<void>
  label: string
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenuItem onClick={() => void handle()}>
      <AppIcon name={copied ? "check" : "chatCopy"} size={16} mono />
      {copied ? tc("copied") : label}
    </DropdownMenuItem>
  )
}

export function CommunityShareMenuItem({
  onCopy,
}: {
  onCopy: () => Promise<void>
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenuItem onClick={() => void handle()}>
      <AppIcon name={copied ? "check" : "chatShare"} size={16} mono />
      {copied ? tc("copied") : tc("share")}
    </DropdownMenuItem>
  )
}
