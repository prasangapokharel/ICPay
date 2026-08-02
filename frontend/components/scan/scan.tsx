"use client"

import { lazy, Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { addressText, parseAddress, type ScannedAddress } from "@/lib/icp-address"
import type { IDetectedBarcode, IScannerError, ScannerErrorKind } from "@yudiel/react-qr-scanner"

// The scanner ships a WASM barcode polyfill and asks for the camera on mount, so
// it is split out and only fetched when a drawer actually opens.
const Scanner = lazy(() =>
  import("@yudiel/react-qr-scanner").then((m) => ({ default: m.Scanner }))
)

const SCAN_KEY = "icpay:scan"

const cameraMessages: Partial<Record<ScannerErrorKind, string>> = {
  "permission-denied": "Camera access was denied. Allow it in your browser settings to scan.",
  "no-camera": "No camera was found on this device.",
  "in-use": "Another app is using the camera. Close it and try again.",
  "overconstrained": "This device's camera cannot be used for scanning.",
  "insecure-context": "Scanning needs a secure (https) connection.",
  "unsupported": "This browser cannot open the camera.",
}

export function QrScanner({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan?: (hit: ScannedAddress) => void
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleDetected = (codes: IDetectedBarcode[]) => {
    const raw = codes[0]?.rawValue
    if (!raw) return

    const hit = parseAddress(raw)
    // A wrong code is far more likely than a broken camera, so the stream stays
    // live and the user can just point at the right one.
    if (!hit) {
      setError("That QR code is not an ICP address.")
      return
    }

    setError(null)
    onOpenChange(false)
    if (onScan) {
      onScan(hit)
      return
    }

    // Handed over in session storage rather than the URL: a static export would
    // need a Suspense boundary for useSearchParams, and an address in browser
    // history outlives the payment it was for.
    sessionStorage.setItem(SCAN_KEY, hit.kind === "icrc1" ? hit.text : addressText(hit))
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
          <DrawerTitle>Scan to send</DrawerTitle>
          <DrawerDescription>
            Point at a QR code holding a principal, account identifier or username.
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
                    setError(cameraMessages[err.kind] ?? "The camera could not be started.")
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
// rather than stored structured so the parser stays the only decoder.
export function takeScannedAddress(): ScannedAddress | null {
  const raw = sessionStorage.getItem(SCAN_KEY)
  if (!raw) return null
  sessionStorage.removeItem(SCAN_KEY)
  return parseAddress(raw)
}
