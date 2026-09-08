import { useCallback, useSyncExternalStore } from 'react'
import type { TokenMetadata } from '@/services/tokens'
import {
  addCustomLedgerId,
  getCustomLedgerIdsSnapshot,
} from '@/lib/wallet/customTokens'
import { subscribeKv } from '@/services/storage/kv'

export function useCustomLedgerIds(principal: string | undefined) {
  const ids = useSyncExternalStore(
    subscribeKv,
    () => (principal ? getCustomLedgerIdsSnapshot(principal) : []),
    () => [],
  )

  const add = useCallback(
    (ledgerId: string, meta?: TokenMetadata) => {
      if (!principal) return []
      return addCustomLedgerId(principal, ledgerId, meta)
    },
    [principal],
  )

  return { ids, add }
}
