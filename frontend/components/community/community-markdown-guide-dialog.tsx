"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityIcon } from "@/components/community/community-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MARKDOWN_EXAMPLE_TEMPLATE,
  MARKDOWN_SYNTAX_ROWS,
} from "@/lib/community/markdownGuide"
import { copyText } from "@/lib/wallet/utils"

export function CommunityMarkdownGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("community")
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const copyExample = async () => {
    await copyText(MARKDOWN_EXAMPLE_TEMPLATE)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85dvh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/50 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold">{t("markdownGuideTitle")}</DialogTitle>
          <DialogDescription>{t("markdownGuideDescription")}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("markdownGuideSyntax")}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/30">
              {MARKDOWN_SYNTAX_ROWS.map((row) => (
                <div
                  key={row.syntax}
                  className="flex items-center justify-between gap-3 border-b border-border/40 px-3 py-2.5 text-sm last:border-b-0"
                >
                  <code className="rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs text-foreground">
                    {row.syntax}
                  </code>
                  <span className="text-muted-foreground">{t(row.labelKey)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("markdownGuideExample")}
            </p>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl border border-border/50 bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground">
              {MARKDOWN_EXAMPLE_TEMPLATE}
            </pre>
          </section>
        </div>

        <div className="border-t border-border/50 px-5 py-4">
          <Button type="button" className="h-11 w-full gap-2 rounded-full" onClick={() => void copyExample()}>
            <CommunityIcon name={copied ? "check" : "copy"} size={16} />
            {copied ? tc("copied") : t("markdownGuideCopy")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
