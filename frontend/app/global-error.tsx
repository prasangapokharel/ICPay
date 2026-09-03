"use client"

import { RouteError } from "@/components/shared/route-error"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <RouteError error={error} reset={reset} title="ICPay hit an error" />
      </body>
    </html>
  )
}
