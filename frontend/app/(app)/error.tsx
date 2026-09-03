"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteError error={error} reset={reset} title="Wallet error" />
}
