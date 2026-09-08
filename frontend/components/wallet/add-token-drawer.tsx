"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useAuth } from "@/components/auth/auth-provider"
import { normalizeLedgerId } from "@/lib/wallet/customTokens"
import { fetchTokenMetadata, type TokenMetadata } from "@/services/tokens"

export function AddTokenDrawer({
  open,
  onOpenChange,
  existingIds,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingIds: string[]
  onAdded: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const [ledgerId, setLedgerId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setLedgerId("")
    setError(null)
    setLoading(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleAdd = async () => {
    setError(null)
    const normalized = normalizeLedgerId(ledgerId)
    if (!normalized) {
      setError(t("addTokenInvalid"))
      return
    }
    if (existingIds.includes(normalized)) {
      setError(t("addTokenExists"))
      return
    }

    setLoading(true)
    try {
      const meta = await fetchTokenMetadata(normalized, identity)
      if (!meta) {
        setError(t("addTokenNotFound"))
        return
      }
      onAdded(normalized, meta)
      handleOpenChange(false)
    } catch {
      setError(t("addTokenNotFound"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("addTokenTitle")}</DrawerTitle>
          <DrawerDescription>{t("addTokenHint")}</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="custom-token-ledger">{t("addTokenLabel")}</Label>
            <Input
              id="custom-token-ledger"
              size="lg"
              value={ledgerId}
              onChange={(e) => setLedgerId(e.target.value)}
              placeholder={t("addTokenPlaceholder")}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="mb-1 rounded-2xl font-mono text-xs"
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DrawerFooter className="pt-2">
          <Button disabled={loading || !ledgerId.trim()} onClick={() => void handleAdd()}>
            {loading ? <Spinner className="size-4" /> : null}
            {t("addTokenAction")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
