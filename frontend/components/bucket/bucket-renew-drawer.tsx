"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { useRenewQuote } from "@/hooks/use-bucket"
import { formatAmount } from "@/lib/wallet-utils"
import { expiresAtToMs } from "@/lib/bucket/bucket"

export function BucketRenewDrawer({
  bucketId,
  open,
  onOpenChange,
  onRenew,
}: {
  bucketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRenew: () => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const { quote, isLoading } = useRenewQuote(bucketId, open)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRenew = async () => {
    setSubmitting(true)
    setError(null)
    const err = await onRenew()
    if (err) {
      setError(err)
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("renewTitle")}</DrawerTitle>
          <DrawerDescription>{t("renewBody")}</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-2 text-sm">
          {isLoading || !quote ? (
            <div className="flex justify-center py-4">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : (
            <>
              <Card size="sm">
                <CardContent className="flex items-center justify-between">
                  <span className="text-muted-foreground">{tc("fee")}</span>
                  <span className="font-semibold tabular-nums">
                    {formatAmount(quote.priceE8s)} ICP
                  </span>
                </CardContent>
              </Card>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("newExpiry")}</span>
                <span>{new Date(expiresAtToMs(quote.newExpiresAt)).toLocaleDateString()}</span>
              </div>
            </>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DrawerFooter>
          <Button size="sm" disabled={submitting || isLoading || !quote} onClick={handleRenew}>
            {submitting ? t("renewing") : t("renewConfirm", { price: quote ? formatAmount(quote.priceE8s) : "—" })}
          </Button>
          <DrawerClose render={<Button variant="outline" size="sm">{tc("cancel")}</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
