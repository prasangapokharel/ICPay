"use client"

import useSWR from "swr"
import { fetchEnhancedTokenFacts } from "@/services/market/icrcLedgerFacts"

export function useLedgerExtras(ledgerId: string | null) {
  return useSWR(
    ledgerId ? (["ledger-extras", ledgerId] as const) : null,
    () => fetchEnhancedTokenFacts(ledgerId!),
    { revalidateOnFocus: false, dedupingInterval: 300_000, revalidateIfStale: false }
  )
}

