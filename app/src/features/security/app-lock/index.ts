import type { ReactNode } from 'react'

export { AppLockProvider, useAppLock } from '@/features/security/app-lock/use-app-lock'
export {
  hasPin,
  savePin,
  verifyPin,
  clearLock,
  isSendLockEnabled,
} from '@/features/security/app-lock/app-lock.service'

export function AppLockGate({ children }: { children?: ReactNode }) {
  return children ?? null
}

