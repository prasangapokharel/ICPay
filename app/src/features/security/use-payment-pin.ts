import { useEffect, useState } from 'react'
import { useAppLock } from '@/features/security/app-lock'
import { hasPin } from '@/features/security/app-lock/app-lock.service'

export function usePaymentPin(open: boolean) {
  const { onSend, verified, markVerified } = useAppLock()
  const [pinStep, setPinStep] = useState(false)

  useEffect(() => {
    if (!open) setPinStep(false)
  }, [open])

  const gate = async (): Promise<boolean> => {
    if (!onSend || verified) return true
    if (!(await hasPin())) return true
    setPinStep(true)
    return false
  }

  return {
    pinStep,
    gate,
    onVerified: () => {
      markVerified()
      setPinStep(false)
    },
    cancel: () => setPinStep(false),
  }
}
