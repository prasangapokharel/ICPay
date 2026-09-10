"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function SwapRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = new URLSearchParams()
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    if (from) query.set("from", from)
    if (to) query.set("to", to)
    const suffix = query.toString()
    router.replace(suffix ? `/trade?${suffix}` : "/trade")
  }, [router, searchParams])

  return null
}

export default function SwapPage() {
  return (
    <Suspense fallback={null}>
      <SwapRedirect />
    </Suspense>
  )
}
