"use client"

import { usePathname } from "next/navigation"
import { PublicFooter } from "@/components/public/footer"

export function PublicFooterGate() {
  const pathname = usePathname()
  if (pathname.startsWith("/market/trade")) return null
  return <PublicFooter />
}
