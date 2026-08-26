"use client"

import { lazy, Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { addressText, parseAddress, type ScannedAddress } from "@/lib/wallet/icpAddress"
import { parseIcrcPaymentUri } from "@/lib/wallet/paymentUri"
import type { IDetectedBarcode, IScannerError, ScannerErrorKind } from "@yudiel/react-qr-scanner"

// The scanner ships a WASM barcode polyfill and asks for the camera on mount, so
// it is split out and only fetched when a drawer actually opens.
const Scanner = lazy(() =>
  import("@yudiel/react-qr-scanner").then((m) => ({ default: m.Scanner }))
)

const SCAN_KEY = "icpay:scan"

// The kinds the catalog has copy for, under scan.errors. Anything else falls
// back to the generic message.
const KNOWN_ERRORS = [
  "permission-denied",
  "no-camera",
  "in-use",
  "overconstrained",
  "insecure-context",
  "unsupported",
] as const

function isKnownError(kind: ScannerErrorKind): kind is (typeof KNOWN_ERRORS)[number] {
  return (KNOWN_ERRORS as readonly string[]).includes(kind)
}

export function QrScanner({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The raw scanned text comes through alongside the parsed address: a payment
  // link also carries an amount and a memo, which are not part of an address.
  onScan?: (hit: ScannedAddress, raw: string) => void
}) {
  const router = useRouter()
  const t = useTranslations("scan")
  const [error, setError] = useState<string | null>(null)

  const handleDetected = (codes: IDetectedBarcode[]) => {
    const raw = codes[0]?.rawValue
    if (!raw) return

    const payment = parseIcrcPaymentUri(raw)
    const hit = payment?.hit ?? parseAddress(raw)
    if (!hit) {
      setError(t("notAddress"))
      return
    }

    setError(null)
    onOpenChange(false)
    if (onScan) {
      onScan(hit, raw)
      return
    }

    // Handed over in session storage rather than the URL: a static export would
    // need a Suspense boundary for useSearchParams, and an address in browser
    // history outlives the payment it was for.
    //
    // A payment link is stored verbatim so its amount and memo survive the hop;
    // anything else is normalised, since the parsed form is what the field wants.
    const handoff = hit.kind === "username" ? raw.trim() : hit.kind === "icrc1" ? hit.text : addressText(hit)
    sessionStorage.setItem(SCAN_KEY, handoff)
    router.push("/transfer")
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null)
        onOpenChange(next)
      }}
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>
            {t("description")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 px-4 pb-4">
          <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
            {/* Mounted only while open so closing the drawer releases the camera. */}
            {open && (
              <Suspense fallback={<Skeleton className="size-full" />}>
                <Scanner
                  onScan={handleDetected}
                  onError={(err: IScannerError) =>
                    setError(isKnownError(err.kind) ? t(`errors.${err.kind}`) : t("failed"))
                  }
                  formats={["qr_code"]}
                  components={{ finder: true, torch: true }}
                  styles={{ container: { width: "100%", height: "100%" } }}
                />
              </Suspense>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Drains the handoff written by a scan that had no onScan handler. Reparsed
// rather than stored structured so the parser stays the only decoder, and the
// raw text comes back too so a payment link's amount and memo can be read off it.
export function takeScannedAddress(): { hit: ScannedAddress; raw: string } | null {
  const raw = sessionStorage.getItem(SCAN_KEY)
  if (!raw) return null
  sessionStorage.removeItem(SCAN_KEY)
  const hit = parseAddress(raw)
  return hit ? { hit, raw } : null
}
