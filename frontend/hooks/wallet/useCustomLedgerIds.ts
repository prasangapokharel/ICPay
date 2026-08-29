"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { TokenMetadata } from "@/services/tokens"
import {
  addCustomLedgerId,
  CUSTOM_TOKENS_EVENT,
  EMPTY_CUSTOM_LEDGER_IDS,
  getCustomLedgerIdsSnapshot,
  removeCustomLedgerId,
} from "@/lib/wallet/customTokens"

function subscribe(principal: string, onStoreChange: () => void) {
  const onChange = (event: Event) => {
    const detail = (event as CustomEvent<{ principal: string }>).detail
    if (detail?.principal === principal) onStoreChange()
  }
  window.addEventListener(CUSTOM_TOKENS_EVENT, onChange)
  return () => window.removeEventListener(CUSTOM_TOKENS_EVENT, onChange)
}

export function useCustomLedgerIds(principal: string | undefined) {
  const ids = useSyncExternalStore(
    (onStoreChange) => (principal ? subscribe(principal, onStoreChange) : () => {}),
    () => (principal ? getCustomLedgerIdsSnapshot(principal) : EMPTY_CUSTOM_LEDGER_IDS),
    () => EMPTY_CUSTOM_LEDGER_IDS
  )

  const add = useCallback(
    (ledgerId: string, meta?: TokenMetadata) => {
      if (!principal) return EMPTY_CUSTOM_LEDGER_IDS
      return addCustomLedgerId(principal, ledgerId, meta)
    },
    [principal]
  )

  const remove = useCallback(
    (ledgerId: string) => {
      if (!principal) return EMPTY_CUSTOM_LEDGER_IDS
      return removeCustomLedgerId(principal, ledgerId)
    },
    [principal]
  )

  return { ids, add, remove }
}
