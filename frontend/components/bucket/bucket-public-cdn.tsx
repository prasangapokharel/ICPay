"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { copyText } from "@/lib/wallet/utils"
import {
  getBucketCdnBase,
  resolvePublicFileUrl,
  type BucketUrlMode,
} from "@/lib/bucket/cdn"
import { cn } from "@/lib/ui/utils"

export function BucketPublicCdn({ publicBaseUrl }: { publicBaseUrl: string }) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [urlMode, setUrlMode] = useState<BucketUrlMode>("raw")
  const [copied, setCopied] = useState(false)
  const cdnEnabled = getBucketCdnBase() !== null
  const displayBase = resolvePublicFileUrl(publicBaseUrl, urlMode)

  const handleCopy = async () => {
    await copyText(displayBase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground"
          >
            <span>{t("publicCdn")}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
              strokeWidth={1.75}
            />
          </Button>
        }
      />
      <CollapsibleContent
        keepMounted
        className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
      >
        <div className="space-y-2 pt-1.5">
          {cdnEnabled ? (
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant={urlMode === "raw" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setUrlMode("raw")}
              >
                {t("urlModeRaw")}
              </Button>
              <Button
                type="button"
                variant={urlMode === "cdn" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setUrlMode("cdn")}
              >
                {t("urlModeCdn")}
              </Button>
            </ButtonGroup>
          ) : null}

          <InputGroup>
            {!cdnEnabled && (
              <InputGroupAddon align="inline-start">
                <InputGroupText className="text-xs">{t("urlModeRaw")}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              readOnly
              value={displayBase}
              className="font-mono text-xs"
              onFocus={(e) => e.target.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={copied ? tc("copied") : tc("copy")}
                onClick={handleCopy}
              >
                <HugeiconsIcon
                  icon={copied ? Tick02Icon : Copy01Icon}
                  className="size-3.5"
                  strokeWidth={1.75}
                />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
